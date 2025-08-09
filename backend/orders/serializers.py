# orders/serializers.py
import logging
import traceback
from rest_framework import serializers
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth import get_user_model
from decimal import Decimal
from .models import Order, OrderItem, OrderUpdate, ShippingMethod, OrderPayment, Coupon, ShippingTier
from products.models import Product, Color, Size
from products.serializers import ColorSerializer, SizeSerializer
from users.models import Address

User = get_user_model()
logger = logging.getLogger(__name__)

# New serializers for order creation with atomic transactions
class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for order items (write-only)"""
    product = serializers.IntegerField()
    color = serializers.IntegerField(allow_null=True, required=False)
    size = serializers.IntegerField(allow_null=True, required=False)
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, read_only=True)
    
    def validate_product(self, value):
        """Validate that product exists"""
        try:
            product = Product.objects.get(id=value)
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist.")
    
    def validate_color(self, value):
        """Validate that color exists if provided"""
        if value is not None:
            try:
                Color.objects.get(id=value)
            except Color.DoesNotExist:
                raise serializers.ValidationError("Color does not exist.")
        return value
    
    def validate_size(self, value):
        """Validate that size exists if provided"""
        if value is not None:
            try:
                Size.objects.get(id=value)
            except Size.DoesNotExist:
                raise serializers.ValidationError("Size does not exist.")
        return value

class OrderPaymentCreateSerializer(serializers.Serializer):
    """Serializer for order payment"""
    sender_number = serializers.CharField(max_length=50)
    transaction_id = serializers.CharField(max_length=100)
    payment_method = serializers.ChoiceField(choices=OrderPayment.PaymentMethod.choices)
    admin_account_number = serializers.CharField(max_length=50, required=False)
    
    def validate_transaction_id(self, value):
        """Validate that transaction ID is unique"""
        if OrderPayment.objects.filter(transaction_id=value).exists():
            raise serializers.ValidationError("Transaction ID already exists.")
        return value

class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders with nested items and payment"""
    items = OrderItemCreateSerializer(many=True, write_only=True)
    payment = OrderPaymentCreateSerializer(write_only=True, required=False)
    coupon_code = serializers.CharField(max_length=50, required=False, write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'customer_name', 'customer_email', 'customer_phone',
            'shipping_address', 'shipping_method', 'items',
            'coupon_code', 'payment', 'order_number', 'total_amount',
            'cart_subtotal', 'status', 'payment_status', 'ordered_at'
        ]
        read_only_fields = ['order_number', 'total_amount', 'cart_subtotal', 'status', 'payment_status', 'ordered_at']
    
    def validate_items(self, value):
        """Validate that items list is not empty"""
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value
    
    def validate_shipping_address(self, value):
        """Validate that shipping address exists"""
        try:
            Address.objects.get(id=value.id)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Shipping address does not exist.")
        return value
    
    def validate_shipping_method(self, value):
        """Validate that shipping method exists and is active"""
        try:
            shipping_method = ShippingMethod.objects.get(id=value.id)
            if not shipping_method.is_active:
                raise serializers.ValidationError("Selected shipping method is not available.")
        except ShippingMethod.DoesNotExist:
            raise serializers.ValidationError("Shipping method does not exist.")
        return value
    
    def create(self, validated_data):
        """Create order with items and payment in atomic transaction"""
        try:
            items_data = validated_data.pop('items')
            payment_data = validated_data.pop('payment', None)
            coupon_code = validated_data.pop('coupon_code', None)
            
            # Get user from request context if available
            request = self.context.get('request')
            user = request.user if request and request.user.is_authenticated else None
            
            with transaction.atomic():
                try:
                    # Compute cart subtotal server-side
                    cart_subtotal = Decimal('0.00')
                    cart_items = []
                    total_quantity = 0
                    
                    for item_data in items_data:
                        try:
                            product = Product.objects.get(id=item_data['product'])
                        except Product.DoesNotExist:
                            logger.warning(f"Product not found: {item_data['product']}")
                            raise serializers.ValidationError(f"Product with id {item_data['product']} does not exist.")
                        except Exception as e:
                            logger.exception(f"Error fetching product {item_data['product']}")
                            traceback.print_exc()
                            raise serializers.ValidationError(f"Error processing product {item_data['product']}: {str(e)}")
                        
                        quantity = item_data['quantity']
                        unit_price = product.price
                        item_total = unit_price * quantity
                        cart_subtotal += item_total
                        total_quantity += quantity
                        
                        # Store for coupon validation
                        cart_items.append({
                            'product': product,
                            'quantity': quantity,
                            'unit_price': unit_price,
                            'total': item_total
                        })
                    
                    # Compute shipping cost
                    try:
                        shipping_method = validated_data['shipping_method']
                        shipping_cost = shipping_method.get_price_for_quantity(total_quantity)
                    except Exception as e:
                        logger.exception("Error calculating shipping cost")
                        traceback.print_exc()
                        raise serializers.ValidationError(f"Error calculating shipping cost: {str(e)}")
                    
                    # Initialize discount amounts
                    product_discount = Decimal('0.00')
                    shipping_discount = Decimal('0.00')
                    
                    # Validate and apply coupon if provided
                    if coupon_code:
                        try:
                            coupon = Coupon.objects.get(code=coupon_code)
                            is_valid, message = coupon.is_valid_for_cart(cart_items, user, cart_subtotal)
                            
                            if not is_valid:
                                logger.warning(f"Coupon validation failed: {coupon_code} - {message}")
                                raise serializers.ValidationError(f"Coupon validation failed: {message}")
                            
                            # Calculate discounts
                            discounts = coupon.calculate_discount(cart_subtotal, shipping_cost)
                            product_discount = Decimal(str(discounts['product_discount']))
                            shipping_discount = Decimal(str(discounts['shipping_discount']))
                            
                        except Coupon.DoesNotExist:
                            logger.warning(f"Invalid coupon code: {coupon_code}")
                            raise serializers.ValidationError("Invalid coupon code.")
                        except Exception as e:
                            logger.exception(f"Error processing coupon: {coupon_code}")
                            traceback.print_exc()
                            raise serializers.ValidationError(f"Error processing coupon: {str(e)}")
                    
                    # Calculate total amount
                    try:
                        total_amount = cart_subtotal - product_discount + shipping_cost - shipping_discount
                        
                        # Ensure total amount is not negative
                        if total_amount < 0:
                            total_amount = Decimal('0.00')
                        
                        # Optional: Validate frontend calculations if provided in context
                        # This can be used to detect calculation discrepancies
                        frontend_subtotal = None
                        frontend_total = None
                        calculation_warnings = []
                        
                        if hasattr(self, 'context') and self.context.get('request'):
                            # Try to get frontend calculation data from request headers or body
                            # This is optional and won't break the order if not provided
                            try:
                                request_data = self.context['request'].data
                                if isinstance(request_data, dict):
                                    frontend_subtotal = request_data.get('frontend_subtotal')
                                    frontend_total = request_data.get('frontend_total')
                                    
                                    if frontend_subtotal is not None:
                                        frontend_subtotal = Decimal(str(frontend_subtotal))
                                        subtotal_diff = abs(cart_subtotal - frontend_subtotal)
                                        
                                        if subtotal_diff > Decimal('0.01'):  # More than 1 cent difference
                                            warning_msg = f"Subtotal calculation mismatch: Frontend={frontend_subtotal}, Server={cart_subtotal}, Difference={subtotal_diff}"
                                            calculation_warnings.append(warning_msg)
                                            logger.warning(f"Order calculation discrepancy: {warning_msg}")
                                    
                                    if frontend_total is not None:
                                        frontend_total = Decimal(str(frontend_total))
                                        total_diff = abs(total_amount - frontend_total)
                                        
                                        if total_diff > Decimal('0.01'):  # More than 1 cent difference
                                            warning_msg = f"Total calculation mismatch: Frontend={frontend_total}, Server={total_amount}, Difference={total_diff}"
                                            calculation_warnings.append(warning_msg)
                                            logger.warning(f"Order calculation discrepancy: {warning_msg}")
                            except (ValueError, TypeError, AttributeError) as e:
                                # Don't fail order creation for calculation validation issues
                                logger.debug(f"Could not validate frontend calculations: {e}")
                                pass
                        
                        # Store warnings in order context for later use
                        if calculation_warnings:
                            logger.info(f"Order calculation warnings: {calculation_warnings}")
                            # We can add these warnings to the order notes or return them in response
                            # For now, we'll log them and they can be handled by the view
                        
                    except Exception as e:
                        logger.exception("Error calculating total amount")
                        traceback.print_exc()
                        raise serializers.ValidationError(f"Error calculating total amount: {str(e)}")
                    
                    # Create the order
                    try:
                        order = Order.objects.create(
                            user=user,
                            cart_subtotal=cart_subtotal,
                            total_amount=total_amount,
                            tracking_number=f"TRK-{str(validated_data.get('order_number', 'TEMP'))[:8]}",  # Temporary tracking number
                            **validated_data
                        )
                        logger.info(f"Order created successfully: {order.order_number}")
                    except Exception as e:
                        logger.exception("Error creating order")
                        traceback.print_exc()
                        raise serializers.ValidationError(f"Error creating order: {str(e)}")
                    
                    # Create order items
                    try:
                        for i, item_data in enumerate(items_data):
                            product = Product.objects.get(id=item_data['product'])
                            color = None
                            size = None
                            
                            if item_data.get('color'):
                                try:
                                    color = Color.objects.get(id=item_data['color'])
                                except Color.DoesNotExist:
                                    logger.warning(f"Color not found: {item_data['color']}")
                                    pass
                            
                            if item_data.get('size'):
                                try:
                                    size = Size.objects.get(id=item_data['size'])
                                except Size.DoesNotExist:
                                    logger.warning(f"Size not found: {item_data['size']}")
                                    pass
                            
                            OrderItem.objects.create(
                                order=order,
                                product=product,
                                color=color,
                                size=size,
                                quantity=item_data['quantity'],
                                unit_price=product.price
                            )
                    except Exception as e:
                        logger.exception("Error creating order items")
                        traceback.print_exc()
                        raise serializers.ValidationError(f"Error creating order items: {str(e)}")
                    
                    # Create payment if provided
                    if payment_data:
                        try:
                            # Set admin account number if not provided
                            if 'admin_account_number' not in payment_data:
                                # Default admin account number based on payment method
                                payment_method = payment_data['payment_method']
                                if payment_method == OrderPayment.PaymentMethod.BKASH:
                                    payment_data['admin_account_number'] = '01700000000'  # Default bKash number
                                elif payment_method == OrderPayment.PaymentMethod.NAGAD:
                                    payment_data['admin_account_number'] = '01800000000'  # Default Nagad number
                                else:
                                    payment_data['admin_account_number'] = 'CARD_GATEWAY'  # Default for card
                            
                            OrderPayment.objects.create(
                                order=order,
                                **payment_data
                            )
                            
                            # Create order update for payment
                            OrderUpdate.objects.create(
                                order=order,
                                status=Order.OrderStatus.PENDING,
                                notes="Payment information received. Awaiting verification."
                            )
                            
                            # Set payment status to paid
                            order.payment_status = Order.PaymentStatus.PAID
                            order.save(update_fields=['payment_status'])
                            
                        except Exception as e:
                            logger.exception("Error creating payment")
                            traceback.print_exc()
                            raise serializers.ValidationError(f"Error processing payment: {str(e)}")
                    
                    # Create initial order update
                    try:
                        OrderUpdate.objects.create(
                            order=order,
                            status=order.status,
                            notes="Order created successfully."
                        )
                    except Exception as e:
                        logger.exception("Error creating order update")
                        traceback.print_exc()
                        # Don't fail the order creation for this
                        pass
                    
                    return order
                    
                except serializers.ValidationError:
                    # Re-raise validation errors as-is (these are 400 errors)
                    raise
                except Exception as e:
                    # Handle any unexpected errors during transaction
                    logger.exception("Order submit failed during transaction")
                    traceback.print_exc()
                    raise serializers.ValidationError(f"Internal server error during order creation: {str(e)}")
                    
        except serializers.ValidationError:
            # Re-raise validation errors as-is (these are 400 errors with serializer.errors)
            raise
        except Exception as e:
            # Handle any unexpected errors outside transaction
            logger.exception("Order submit failed")
            traceback.print_exc()
            raise serializers.ValidationError(f"Internal server error: {str(e)}")

# Read-only serializers for responses
class OrderItemReadSerializer(serializers.ModelSerializer):
    """Read-only serializer for order items"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    color_name = serializers.CharField(source='color.name', read_only=True)
    size_name = serializers.CharField(source='size.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'color', 'color_name', 
                 'size', 'size_name', 'quantity', 'unit_price']

class OrderPaymentReadSerializer(serializers.ModelSerializer):
    """Read-only serializer for order payment"""
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = OrderPayment
        fields = ['admin_account_number', 'sender_number', 'transaction_id', 
                 'payment_method', 'payment_method_display', 'created_at']

class OrderReadSerializer(serializers.ModelSerializer):
    """Read-only serializer for order details"""
    items = OrderItemReadSerializer(many=True, read_only=True)
    payment = OrderPaymentReadSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    shipping_method_name = serializers.CharField(source='shipping_method.name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'total_amount', 'cart_subtotal', 
                 'status', 'status_display', 'payment_status', 'payment_status_display',
                 'customer_name', 'customer_email', 'customer_phone',
                 'shipping_address', 'shipping_method', 'shipping_method_name',
                 'tracking_number', 'ordered_at', 'items', 'payment']

# Legacy serializers (keeping for backward compatibility)

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class ShippingTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingTier
        fields = ['id', 'min_quantity', 'price']

class ShippingMethodSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='name', read_only=True)  # Alias 'name' as 'title'
    shipping_tiers = ShippingTierSerializer(many=True, read_only=True)
    
    class Meta:
        model = ShippingMethod
        fields = ['id', 'title', 'name', 'description', 'price', 'delivery_estimated_time', 'shipping_tiers']
    
    def to_representation(self, instance):
        """Add dynamic pricing information"""
        representation = super().to_representation(instance)
        
        # Add some example quantity-based pricing info
        representation['pricing_examples'] = []
        for qty in [1, 5, 10, 20]:
            price = instance.get_price_for_quantity(qty)
            representation['pricing_examples'].append({
                'quantity': qty,
                'price': str(price)
            })
        
        return representation

class CouponSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    is_valid_period = serializers.BooleanField(read_only=True)
    eligible_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'type', 'type_display', 'discount_percent', 
            'min_quantity_required', 'min_cart_total', 'active', 'is_expired', 
            'is_valid_period', 'eligible_users_count', 'created_at', 'valid_from', 'expires_at'
        ]
        read_only_fields = ['created_at', 'is_expired', 'is_valid_period']
    
    def get_eligible_users_count(self, obj):
        """Return count of eligible users for USER_SPECIFIC coupons"""
        if obj.type == obj.CouponType.USER_SPECIFIC:
            return obj.eligible_users.count()
        return None

class CouponValidationSerializer(serializers.Serializer):
    """Serializer for validating coupon against cart items"""
    coupon_code = serializers.CharField(max_length=50)
    cart_items = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of cart items with quantity and product info"
    )
    cart_total = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        help_text="Total cart value for CART_TOTAL_DISCOUNT validation"
    )
    user_id = serializers.IntegerField(
        required=False,
        help_text="User ID for user-specific coupon validation"
    )

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
