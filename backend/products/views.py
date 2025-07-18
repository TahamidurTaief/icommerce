# products/views.py
from rest_framework import viewsets, permissions
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from .permissions import IsShopOwnerOrReadOnly # Import the custom permission

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # For simplicity, only admins can edit categories.
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            # Allow any user to view the list and details
            return [permissions.AllowAny()]
        return super().get_permissions()


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsShopOwnerOrReadOnly] # Use our custom permission
    lookup_field = 'slug'

    def get_queryset(self):
        """
        Ensure that users can only see products from active shops.
        """
        return Product.objects.filter(is_active=True, shop__is_active=True)