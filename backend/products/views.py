# backend/products/views.py

from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Product, Category, SubCategory, ProductSpecification
from .serializers import ProductSerializer, CategorySerializer, SubCategorySerializer
from .permissions import IsShopOwnerOrReadOnly
from .filters import ProductFilter

# --- This custom pagination class remains unchanged ---
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsShopOwnerOrReadOnly]
    filterset_class = ProductFilter
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        serializer.save(shop=self.request.user.shop)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    lookup_field = 'slug'

# --- NEW: View to get unique color specifications ---
class ColorListView(APIView):
    """
    A view to list all unique color values from product specifications.
    This provides the data needed for the color filter in the sidebar.
    """
    permission_classes = [permissions.AllowAny] # Anyone can view colors

    def get(self, request, format=None):
        # Fetch distinct color values where the specification name is 'Color'
        colors = ProductSpecification.objects.filter(name__iexact='Color').values_list('value', flat=True).distinct()
        
        # A helper to map color names to hex codes for the UI, as this is not stored in the DB.
        def name_to_hex(color_name):
            mapping = {
                'black': '#000000', 'white': '#ffffff', 'red': '#ff0000',
                'green': '#008000', 'blue': '#0000ff', 'yellow': '#ffff00',
                'cyan': '#00ffff', 'magenta': '#ff00ff', 'silver': '#c0c0c0',
                'gray': '#808080', 'maroon': '#800000', 'olive': '#808000',
                'purple': '#800080', 'teal': '#008080', 'navy': '#000080'
            }
            return mapping.get(color_name.lower(), '#cccccc') # Default to gray

        # Structure the response to match the frontend's original data structure
        color_data = [
            {
                'id': color.lower().replace(" ", "-"),
                'name': color.capitalize(),
                'hex': name_to_hex(color)
            }
            for color in colors
        ]
        return Response(color_data)