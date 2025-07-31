# products/views.py
from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Product, Category, SubCategory, Color, Size
from .serializers import ProductSerializer, CategorySerializer, SubCategorySerializer, ColorSerializer, SizeSerializer
from .permissions import IsShopOwnerOrReadOnly
from .filters import ProductFilter

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('shop', 'sub_category__category').prefetch_related('colors', 'sizes', 'reviews')
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
        # Assumes a user has a one-to-one relationship with a shop
        if hasattr(self.request.user, 'shop'):
            serializer.save(shop=self.request.user.shop)
        else:
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

class ColorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer
    permission_classes = [permissions.AllowAny]

class SizeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [permissions.AllowAny]
