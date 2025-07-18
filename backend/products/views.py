# products/views.py
from rest_framework import viewsets, permissions
from .models import Product, Category, SubCategory
from .serializers import ProductSerializer, CategorySerializer, SubCategorySerializer
from .permissions import IsShopOwnerOrReadOnly



class SubCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class SubCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.
    The serializer now handles nesting additional data.
    """
    queryset = Product.objects.filter(is_active=True, shop__is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsShopOwnerOrReadOnly]
    lookup_field = 'slug'