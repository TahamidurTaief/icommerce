# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, OrderUpdate, ShippingMethod
from products.serializers import ColorSerializer, SizeSerializer
from users.models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class ShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingMethod
        fields = ['id', 'name', 'description', 'price']

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.StringRelatedField()
    color = serializers.StringRelatedField()
    size = serializers.StringRelatedField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'color', 'size', 'quantity', 'unit_price']

class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderUpdate
        fields = ['id', 'status', 'notes', 'timestamp']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    updates = OrderUpdateSerializer(many=True, read_only=True)
    shipping_method = ShippingMethodSerializer(read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'status', 'payment_status', 
            'shipping_address', 'shipping_method', 'tracking_number', 
            'ordered_at', 'items', 'updates'
        ]
