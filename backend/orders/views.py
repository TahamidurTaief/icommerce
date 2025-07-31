# orders/views.py
from rest_framework import viewsets, permissions
from .models import Order, ShippingMethod
from .serializers import OrderSerializer, ShippingMethodSerializer

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows a user to view their own orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        """
        This view should return a list of all the orders
        for the currently authenticated user.
        """
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'updates')

class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows shipping methods to be viewed.
    """
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
    permission_classes = [permissions.AllowAny]
