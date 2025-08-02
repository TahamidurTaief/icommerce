# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, OrderUpdate, ShippingMethod, OrderPayment
from products.serializers import ColorSerializer, SizeSerializer
from users.models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class ShippingMethodSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='name', read_only=True)  # Alias 'name' as 'title'
    
    class Meta:
        model = ShippingMethod
        fields = ['id', 'title', 'name', 'description', 'price']

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.StringRelatedField()
    color = serializers.StringRelatedField()
    size = serializers.StringRelatedField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'color', 'size', 'quantity', 'unit_price']

class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'color', 'size', 'quantity', 'unit_price']

class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderUpdate
        fields = ['id', 'status', 'notes', 'timestamp']

class OrderPaymentSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = OrderPayment
        fields = [
            'id', 'order', 'admin_account_number', 'sender_number', 
            'transaction_id', 'payment_method', 'payment_method_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    # Payment fields for order creation
    sender_number = serializers.CharField(max_length=50, write_only=True)
    transaction_id = serializers.CharField(max_length=100, write_only=True)
    payment_method = serializers.ChoiceField(choices=OrderPayment.PaymentMethod.choices, write_only=True)
    
    # Order items for creation
    items = OrderItemCreateSerializer(many=True, write_only=True)
    
    # User details for order creation (optional, can be used for guest orders)
    customer_name = serializers.CharField(max_length=100, required=False, write_only=True)
    customer_email = serializers.EmailField(required=False, write_only=True)
    customer_phone = serializers.CharField(max_length=50, required=False, write_only=True)
    
    # Cart totals for validation
    cart_subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, write_only=True, required=False)
    
    class Meta:
        model = Order
        fields = [
            'total_amount', 'shipping_address', 'shipping_method',
            'sender_number', 'transaction_id', 'payment_method', 'items',
            'customer_name', 'customer_email', 'customer_phone', 'cart_subtotal'
        ]
    
    def validate(self, data):
        """
        Validate the order data and recalculate totals on the backend.
        """
        shipping_method = data.get('shipping_method')
        items_data = data.get('items', [])
        
        # Validate shipping method
        if shipping_method and not shipping_method.is_active:
            raise serializers.ValidationError("Selected shipping method is not available.")
        
        # Calculate cart subtotal from items
        calculated_subtotal = sum(
            item['unit_price'] * item['quantity'] for item in items_data
        )
        
        # Validate provided cart subtotal (if given)
        if 'cart_subtotal' in data:
            provided_subtotal = data['cart_subtotal']
            if abs(calculated_subtotal - provided_subtotal) > 0.01:  # Allow for small rounding differences
                raise serializers.ValidationError(
                    f"Cart subtotal mismatch. Calculated: {calculated_subtotal}, Provided: {provided_subtotal}"
                )
        
        # Calculate shipping cost
        shipping_cost = shipping_method.price if shipping_method else 0
        
        # Calculate expected total
        expected_total = calculated_subtotal + shipping_cost
        provided_total = data.get('total_amount', expected_total)
        
        # Validate total amount
        if abs(expected_total - provided_total) > 0.01:  # Allow for small rounding differences
            raise serializers.ValidationError(
                f"Total amount mismatch. Expected: {expected_total} (Subtotal: {calculated_subtotal} + Shipping: {shipping_cost}), Provided: {provided_total}"
            )
        
        # Set the correct total amount
        data['total_amount'] = expected_total
        
        return data
    
    def create(self, validated_data):
        # Extract payment and items data
        payment_data = {
            'sender_number': validated_data.pop('sender_number'),
            'transaction_id': validated_data.pop('transaction_id'),
            'payment_method': validated_data.pop('payment_method'),
        }
        items_data = validated_data.pop('items', [])
        
        # Extract user details (remove from order data)
        customer_name = validated_data.pop('customer_name', None)
        customer_email = validated_data.pop('customer_email', None)
        customer_phone = validated_data.pop('customer_phone', None)
        cart_subtotal = validated_data.pop('cart_subtotal', None)
        
        # Set the user for the order
        validated_data['user'] = self.context['request'].user
        
        # Create the order
        order = Order.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        # Create the payment record
        OrderPayment.objects.create(order=order, **payment_data)
        
        return order

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    updates = OrderUpdateSerializer(many=True, read_only=True)
    payment = OrderPaymentSerializer(read_only=True)
    shipping_method = ShippingMethodSerializer(read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'status', 'payment_status', 
            'shipping_address', 'shipping_method', 'tracking_number', 
            'ordered_at', 'items', 'updates', 'payment'
        ]
