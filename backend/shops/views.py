# shops/views.py
from rest_framework import viewsets, permissions
from .models import Shop
from .serializers import ShopSerializer

class ShopViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing shops.
    - Anyone can view shops.
    - Only authenticated users can create a shop.
    - Only the owner can update or delete their shop.
    """
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    # Use IsAuthenticatedOrReadOnly for basic create/edit permissions
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner.
        serializer.save(owner=self.request.user)