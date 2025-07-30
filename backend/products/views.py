# products/views.py
from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product, Category, SubCategory, ProductSpecification
from .serializers import ProductSerializer, CategorySerializer, SubCategorySerializer
from .permissions import IsShopOwnerOrReadOnly
from .filters import ProductFilter

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('shop', 'sub_category__category').prefetch_related('specifications', 'additional_images', 'additional_descriptions', 'reviews')
    serializer_class = ProductSerializer
    permission_classes = [IsShopOwnerOrReadOnly]
    filterset_class = ProductFilter
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        # This assumes a user can only own one shop. Adjust if a user can have multiple.
        shop = self.request.user.shops.first()
        if shop:
            serializer.save(shop=shop)
        else:
            # Handle case where user does not own a shop
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You do not have a shop to add products to.")

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    lookup_field = 'slug'

class ColorListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        colors = ProductSpecification.objects.filter(name__iexact='Color').values_list('value', flat=True).distinct()
        def name_to_hex(color_name):
            mapping = {
                'black': '#000000', 'white': '#ffffff', 'red': '#ff0000',
                'green': '#008000', 'blue': '#0000ff', 'yellow': '#ffff00',
                'cyan': '#00ffff', 'magenta': '#ff00ff', 'silver': '#c0c0c0',
                'gray': '#808080', 'maroon': '#800000', 'olive': '#808000',
                'purple': '#800080', 'teal': '#008080', 'navy': '#000080'
            }
            return mapping.get(color_name.lower(), '#cccccc')
        color_data = [{'id': color.lower().replace(" ", "-"), 'name': color.capitalize(), 'hex': name_to_hex(color)} for color in colors]
        return Response(color_data)