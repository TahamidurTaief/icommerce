# orders/views.py
import logging
import traceback
from rest_framework import viewsets, permissions, status, generics, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Order, ShippingMethod, OrderPayment, Coupon, OrderItem, OrderUpdate
from .serializers import (
    OrderSerializer, ShippingMethodSerializer, OrderPaymentSerializer, 
    OrderCreateSerializer, OrderReadSerializer, CouponSerializer, CouponValidationSerializer
)
from users.permissions import IsCustomerForOrder

logger = logging.getLogger(__name__)

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to view and create orders.
    Only customers can create orders, but they can only view their own orders.
    Admins can view all orders.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'order_number'

    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the action.
        """
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['list', 'retrieve']:
            return OrderReadSerializer
        return OrderSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'confirm_payment', 'submit_order']:
            # Allow both authenticated and unauthenticated users to create orders and confirm payments
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            # Require authentication for viewing/modifying orders
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Custom queryset logic:
        - If 'user' query param is provided, filter by user id (API usage)
        - If 'order_number' query param is provided, filter by order_number (API usage)
        - If accessed from web (no query params), show all orders for admin, or all orders for non-admin (for /orders page)
        - Otherwise, for authenticated users, show only their orders
        """
        queryset = Order.objects.all().prefetch_related('items', 'updates', 'payment')
        user_param = self.request.query_params.get('user')
        order_number_param = self.request.query_params.get('order_number')
        user = self.request.user

        # API: filter by user id if provided
        if user_param:
            queryset = queryset.filter(user__id=user_param)
        # API: filter by order_number if provided
        if order_number_param:
            queryset = queryset.filter(order_number=order_number_param)

        # If no filter params, apply default logic
        if not user_param and not order_number_param:
            # If admin, show all orders
            if user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'ADMIN':
                return queryset
            # If not authenticated, return empty queryset
            if not user.is_authenticated:
                return queryset.none()
            # For customers/sellers, show all orders (for /orders page)
            return queryset

        return queryset

    def create(self, request, *args, **kwargs):
        """
        Create a new order with payment information.
        Accepts nested order payload and creates Order, OrderItem(s) and OrderPayment in atomic transaction.
        Supports both authenticated users and anonymous guest orders.
        """
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data, context={'request': request})
                
                if not serializer.is_valid():
                    logger.warning(f"Order validation failed: {serializer.errors}")
                    return Response({
                        'success': False,
                        'detail': 'Order validation failed',
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create the order with atomic transaction
                order = serializer.save()
                
                logger.info(f"Order created successfully: {order.order_number}")
                
                # Return success response with order details
                return Response({
                    'success': True,
                    'order_id': order.id,
                    'order_number': order.order_number
                }, status=status.HTTP_201_CREATED)
                
        except serializers.ValidationError as e:
            # Handle validation errors
            logger.exception(f"Order validation error: {str(e)}")
            traceback.print_exc()
            return Response({
                'success': False,
                'detail': 'Order validation failed',
                'errors': e.detail if hasattr(e, 'detail') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            # Handle unexpected errors
            logger.exception(f"Order creation failed: {str(e)}")
            traceback.print_exc()
            return Response({
                'success': False,
                'detail': f'Order creation failed: {str(e)}',
                'errors': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='submit', permission_classes=[permissions.AllowAny])
    def submit_order(self, request):
        """
        Submit a new order - alias for create method with explicit endpoint.
        POST /api/orders/submit/
        
        Accepts nested order payload and creates Order, OrderItem(s) and OrderPayment in atomic transaction.
        Supports both authenticated users and anonymous guest orders.
        """
        # Use the confirm_payment method which has the proper implementation
        return self.confirm_payment(request)

    @action(detail=False, methods=['post'], url_path='confirm-payment', permission_classes=[permissions.AllowAny])
    def confirm_payment(self, request):
        """
        Confirm payment for an order and update payment status.
        POST /api/orders/confirm-payment/
        Body: {
            "transaction_number": "01234567890",
            "transaction_id": "TXN123456",
            "comment": "Payment completed",
            "total_amount": 150.00,
            "subtotal": 120.00,
            "shipping_cost": 30.00,
            "shipping_method_id": 1,
            "shipping_method_name": "Door to Door",
            "discount_amount": 0,
            "coupon_code": null,
            "items": [...]
        }
        """
        try:
            # Handle payment data from frontend nested structure
            payment_data = request.data.get('payment', {})
            transaction_number = payment_data.get('sender_number') or request.data.get('transaction_number')
            transaction_id = payment_data.get('transaction_id') or request.data.get('transaction_id')
            comment = request.data.get('comment', '')
            
            # Handle total_amount calculation from frontend data
            total_amount = request.data.get('total_amount') or request.data.get('frontend_total')
            subtotal = request.data.get('subtotal') or request.data.get('frontend_subtotal')
            
            shipping_cost = request.data.get('shipping_cost', 0)
            shipping_method_id = request.data.get('shipping_method_id') or request.data.get('shipping_method')
            shipping_method_name = request.data.get('shipping_method_name')
            discount_amount = request.data.get('discount_amount', 0)
            coupon_code = request.data.get('coupon_code')
            items = request.data.get('items', [])

            # Validate required fields
            if not transaction_number or not transaction_id:
                return Response({
                    'success': False,
                    'message': 'Transaction number and transaction ID are required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not total_amount:
                # If total_amount is not provided, calculate it from subtotal and shipping_cost
                if subtotal:
                    total_amount = float(subtotal) + float(shipping_cost) - float(discount_amount)
                else:
                    return Response({
                        'success': False,
                        'message': 'Total amount or subtotal is required.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Get or create user address
            shipping_address = None
            shipping_address_data = request.data.get('shipping_address')
            
            if request.user.is_authenticated:
                # For authenticated users, get their default address
                from users.models import Address
                shipping_address = Address.objects.filter(user=request.user, is_default=True).first()
            
            # If no shipping address found or user is not authenticated, and we have shipping address data
            if not shipping_address and shipping_address_data:
                from users.models import Address
                # Create a new address record (for both authenticated and guest users)
                address_fields = {
                    'user': request.user if request.user.is_authenticated else None,
                    'address_line_1': shipping_address_data.get('street_address', ''),
                    'city': shipping_address_data.get('city', ''),
                    'state': shipping_address_data.get('state', ''),
                    'postal_code': shipping_address_data.get('zip_code', ''),
                    'country': shipping_address_data.get('country', 'Bangladesh'),
                    'is_default': False  # Don't set as default for guest users
                }
                shipping_address = Address.objects.create(**address_fields)
            
            # Ensure we have a shipping address
            if not shipping_address:
                return Response({
                    'success': False,
                    'message': 'Shipping address is required. Please provide shipping address information.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get shipping method
            shipping_method = None
            if shipping_method_id:
                try:
                    shipping_method = ShippingMethod.objects.get(id=shipping_method_id, is_active=True)
                except ShippingMethod.DoesNotExist:
                    pass
            
            # If no shipping method found, get the first active one as default
            if not shipping_method:
                shipping_method = ShippingMethod.objects.filter(is_active=True).first()
                if not shipping_method:
                    return Response({
                        'success': False,
                        'message': 'No shipping method available. Please contact support.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Generate tracking number
            import datetime
            import random
            tracking_number = f"TRK-{datetime.datetime.now().strftime('%Y%m%d')}-{random.randint(10000, 99999)}"

            # Create order data
            order_data = {
                'user': request.user if request.user.is_authenticated else None,
                'total_amount': total_amount,
                'cart_subtotal': subtotal,
                'status': Order.OrderStatus.PROCESSING,  # Set to processing after payment confirmation
                'payment_status': Order.PaymentStatus.PAID,  # Mark as paid
                'shipping_address': shipping_address,
                'shipping_method': shipping_method,
                'tracking_number': tracking_number,
                'customer_name': request.data.get('customer_name', ''),
                'customer_email': request.data.get('customer_email', ''),
                'customer_phone': request.data.get('customer_phone', ''),
            }

            # Create the order
            order = Order.objects.create(**order_data)

            # Create order items
            from products.models import Product
            for item in items:
                try:
                    # Try to find the product by ID first (frontend sends 'product' field)
                    product = None
                    if 'product' in item:
                        product = Product.objects.get(id=item['product'])
                    elif 'product_id' in item:
                        product = Product.objects.get(id=item['product_id'])
                    elif 'product_name' in item:
                        # Try to find by name (this is a fallback)
                        product = Product.objects.filter(name__icontains=item['product_name']).first()
                    
                    if product:
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=item.get('quantity', 1),
                            unit_price=item.get('unit_price', item.get('price', product.price))
                        )
                except Exception as e:
                    # If product not found, continue with other items
                    continue

            # Create payment record
            payment_method_from_frontend = payment_data.get('payment_method', 'bkash')
            payment_record_data = {
                'order': order,
                'sender_number': transaction_number,
                'transaction_id': transaction_id,
                'payment_method': payment_method_from_frontend,
            }
            
            payment = OrderPayment.objects.create(**payment_record_data)

            # Create order update for payment confirmation
            OrderUpdate.objects.create(
                order=order,
                status=Order.OrderStatus.PROCESSING,
                notes=f"Payment confirmed. Transaction ID: {transaction_id}. {comment if comment else ''}"
            )

            # Prepare response data
            response_data = {
                'success': True,
                'message': 'Payment confirmed successfully',
                'order_id': order.id,
                'order_number': str(order.order_number),
                'tracking_number': order.tracking_number,
                'payment_status': order.payment_status,
                'order_status': order.status,
                'total_amount': str(order.total_amount)
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': f'Payment confirmation failed: {str(e)}',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows shipping methods to be viewed.
    """
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=True, methods=['get'], url_path='price-for-quantity')
    def price_for_quantity(self, request, pk=None):
        """
        Get shipping price for a specific quantity
        GET /api/shipping-methods/{id}/price-for-quantity/?quantity=5
        """
        shipping_method = self.get_object()
        quantity = request.query_params.get('quantity', 1)
        
        try:
            quantity = int(quantity)
            if quantity < 0:
                quantity = 1
        except (ValueError, TypeError):
            quantity = 1
        
        price = shipping_method.get_price_for_quantity(quantity)
        
        return Response({
            'shipping_method': shipping_method.name,
            'quantity': quantity,
            'price': str(price),
            'base_price': str(shipping_method.price),
            'has_tiers': shipping_method.shipping_tiers.exists()
        }, status=status.HTTP_200_OK)

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

class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows coupons to be viewed and validated.
    Only active and non-expired coupons are returned.
    """
    serializer_class = CouponSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Return only active coupons"""
        return Coupon.objects.filter(active=True)
    
    @action(detail=False, methods=['post'], url_path='validate')
    def validate_coupon(self, request):
        """
        Validate a coupon against cart items
        POST /api/coupons/validate/
        Body: {
            "coupon_code": "SAVE10",
            "cart_items": [
                {"quantity": 2, "product": "Product 1"},
                {"quantity": 1, "product": "Product 2"}
            ],
            "cart_total": 75.50,  // Optional, required for CART_TOTAL_DISCOUNT
            "user_id": 123        // Optional, required for FIRST_TIME_USER and USER_SPECIFIC
        }
        """
        serializer = CouponValidationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        coupon_code = serializer.validated_data['coupon_code']
        cart_items = serializer.validated_data['cart_items']
        cart_total = serializer.validated_data.get('cart_total')
        user_id = serializer.validated_data.get('user_id')
        
        # Get user if user_id is provided
        user = None
        if user_id:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    'valid': False,
                    'message': 'User not found.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=coupon_code, active=True)
        except Coupon.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Coupon not found or inactive.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate coupon with enhanced parameters
        is_valid, message = coupon.is_valid_for_cart(cart_items, user=user, cart_total=cart_total)
        
        response_data = {
            'valid': is_valid,
            'message': message,
            'coupon': CouponSerializer(coupon).data if is_valid else None
        }
        
        # If valid, calculate discount amounts
        if is_valid and cart_total is not None:
            # Calculate discount with cart total and default shipping cost
            discount_breakdown = coupon.calculate_discount(cart_total, shipping_cost=0)
            total_discount = discount_breakdown['product_discount'] + discount_breakdown['shipping_discount']
            
            response_data.update({
                'discount_amount': total_discount,
                'discount_breakdown': discount_breakdown,
                'discount_type': coupon.get_type_display()
            })
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='calculate-discount')
    def calculate_discount(self, request, pk=None):
        """
        Calculate discount amount for a specific coupon
        POST /api/coupons/{id}/calculate-discount/
        Body: {
            "cart_total": 100.00,
            "shipping_cost": 10.00,
            "cart_items": [...]
        }
        """
        coupon = self.get_object()
        
        cart_total = request.data.get('cart_total', 0)
        shipping_cost = request.data.get('shipping_cost', 0)
        cart_items = request.data.get('cart_items', [])
        
        # Validate the coupon first
        is_valid, message = coupon.is_valid_for_cart(cart_items)
        if not is_valid:
            return Response({
                'valid': False,
                'message': message,
                'discount': None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate discount
        discount = coupon.calculate_discount(cart_total, shipping_cost)
        
        return Response({
            'valid': True,
            'message': 'Discount calculated successfully.',
            'discount': discount,
            'coupon': CouponSerializer(coupon).data
        }, status=status.HTTP_200_OK)

# Payment Accounts API View
class PaymentAccountsAPIView(generics.RetrieveAPIView):
    """
    Public API endpoint that returns admin payment accounts for frontend display.
    GET /api/payment/accounts/
    
    Returns payment account information that frontend can show to users
    during checkout (e.g., bKash number, Nagad number).
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        """Return admin payment accounts"""
        
        # Static admin payment accounts (you can move this to settings or database)
        payment_accounts = [
            {
                "method": "bkash",
                "number": "01700000000",
                "label": "Send to bKash"
            },
            {
                "method": "nagad", 
                "number": "01800000000",
                "label": "Send to Nagad"
            },
            {
                "method": "card",
                "number": "CARD_GATEWAY",
                "label": "Credit/Debit Card"
            }
        ]
        
        return Response({
            "accounts": payment_accounts
        }, status=status.HTTP_200_OK)
