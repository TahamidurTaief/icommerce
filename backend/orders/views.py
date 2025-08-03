# orders/views.py
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, ShippingMethod, OrderPayment
from .serializers import (
    OrderSerializer, ShippingMethodSerializer, OrderPaymentSerializer, 
    OrderCreateSerializer
)
from users.permissions import IsCustomerForOrder

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to view and create orders.
    Only customers can create orders, but they can only view their own orders.
    Admins can view all orders.
    """
    permission_classes = [IsCustomerForOrder]
    lookup_field = 'order_number'

    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the action.
        """
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        """
        This view should return a list of all the orders
        for the currently authenticated user, or all orders for admins.
        """
        # Check if user is admin
        if (hasattr(self.request.user, 'user_type') and 
            self.request.user.user_type == 'ADMIN'):
            return Order.objects.all().prefetch_related('items', 'updates', 'payment')
        
        # For customers, return only their orders
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'updates', 'payment')

    def create(self, request, *args, **kwargs):
        """
        Create a new order with payment information.
        Automatically assigns the current user to the order.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Ensure the order is created for the current user
        order = serializer.save(user=request.user)
        
        # Return success response with order details
        response_serializer = OrderSerializer(order)
        return Response({
            'success': True,
            'message': 'Order created successfully',
            'order_id': order.id,
            'order_number': order.order_number,
            'order': response_serializer.data
        }, status=status.HTTP_201_CREATED)

class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows shipping methods to be viewed.
    """
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
    permission_classes = [permissions.AllowAny]

class OrderPaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows order payments to be created and viewed.
    """
    serializer_class = OrderPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return payment information for orders
        belonging to the currently authenticated user.
        """
        return OrderPayment.objects.filter(order__user=self.request.user)

class ShippingMethodListAPIView(generics.ListAPIView):
    """
    Public API endpoint that returns all available shipping methods.
    No authentication required.
    """
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
    permission_classes = [permissions.AllowAny]
