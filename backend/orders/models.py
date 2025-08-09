# orders/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from products.models import Product, Color, Size
from users.models import Address

class ShippingMethod(models.Model):
    name = models.CharField(max_length=100, help_text="e.g., By Air, By Ship, Door to Door")
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Base price (used if no tiers defined)")
    delivery_estimated_time = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., '1-2 days', '5-7 days', '2-3 weeks'")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - ${self.price}"
    
    def get_price_for_quantity(self, quantity):
        """
        Get the appropriate shipping price based on quantity and shipping tiers.
        
        Args:
            quantity (int): Number of items being shipped
            
        Returns:
            Decimal: The shipping price for the given quantity
        """
        # Get all shipping tiers for this method, ordered by min_quantity ascending
        tiers = self.shipping_tiers.filter(min_quantity__lte=quantity).order_by('-min_quantity')
        
        if tiers.exists():
            # Return the price from the highest qualifying tier
            return tiers.first().price
        else:
            # No qualifying tiers found, return base price
            return self.price

class ShippingTier(models.Model):
    shipping_method = models.ForeignKey(ShippingMethod, on_delete=models.CASCADE, related_name='shipping_tiers')
    min_quantity = models.PositiveIntegerField(help_text="Minimum quantity required for this pricing tier")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price for this quantity tier")
    
    class Meta:
        ordering = ['min_quantity']
        unique_together = ['shipping_method', 'min_quantity']
        verbose_name = "Shipping Tier"
        verbose_name_plural = "Shipping Tiers"
    
    def __str__(self):
        return f"{self.shipping_method.name} - {self.min_quantity}+ items: ${self.price}"

class Coupon(models.Model):
    class CouponType(models.TextChoices):
        PRODUCT_DISCOUNT = 'PRODUCT_DISCOUNT', 'Product Discount'
        MIN_PRODUCT_QUANTITY = 'MIN_PRODUCT_QUANTITY', 'Minimum Product Quantity'
        SHIPPING_DISCOUNT = 'SHIPPING_DISCOUNT', 'Shipping Discount'
        CART_TOTAL_DISCOUNT = 'CART_TOTAL_DISCOUNT', 'Cart Total Discount'
        FIRST_TIME_USER = 'FIRST_TIME_USER', 'First Time User'
        USER_SPECIFIC = 'USER_SPECIFIC', 'User Specific'
    
    code = models.CharField(max_length=50, unique=True, help_text="Unique coupon code")
    type = models.CharField(max_length=25, choices=CouponType.choices, default=CouponType.PRODUCT_DISCOUNT)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, help_text="Discount percentage (0-100)")
    min_quantity_required = models.PositiveIntegerField(default=1, help_text="Minimum quantity required to apply coupon")
    min_cart_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Minimum cart total required for CART_TOTAL_DISCOUNT")
    eligible_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='specific_coupons', help_text="Users eligible for USER_SPECIFIC coupons")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    valid_from = models.DateTimeField(default=timezone.now, help_text="Coupon becomes valid from this date and time")
    expires_at = models.DateTimeField(help_text="Coupon expiration date and time")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Coupon"
        verbose_name_plural = "Coupons"
    
    def __str__(self):
        return f"{self.code} - {self.get_type_display()} ({self.discount_percent}%)"
    
    def is_expired(self):
        """Check if the coupon has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid_period(self):
        """Check if the current time is within the coupon's valid period"""
        now = timezone.now()
        return self.valid_from <= now <= self.expires_at
    
    def is_valid_for_cart(self, cart_items, user=None, cart_total=None):
        """
        Validate if the coupon can be applied to the given cart
        
        Args:
            cart_items: List of cart items, each having 'quantity' and 'product' attributes
            user: User instance for user-specific validations (optional)
            cart_total: Total cart amount for cart total discount validation (optional)
            
        Returns:
            tuple: (is_valid: bool, message: str)
        """
        # Check if coupon is active
        if not self.active:
            return False, "This coupon is not active."
        
        # Check if current time is within valid period (valid_from to expires_at)
        if not self.is_valid_period():
            now = timezone.now()
            if now < self.valid_from:
                return False, f"This coupon is not yet valid. It becomes active on {self.valid_from.strftime('%Y-%m-%d %H:%M')}."
            elif now > self.expires_at:
                return False, "This coupon has expired."
        
        # Calculate total quantity in cart
        total_quantity = sum(item.get('quantity', 0) for item in cart_items)
        
        # Type-specific validations
        if self.type == self.CouponType.PRODUCT_DISCOUNT:
            # PRODUCT_DISCOUNT: Apply to product subtotal
            # Basic quantity check for any product discount
            if total_quantity < self.min_quantity_required:
                return False, f"You need at least {self.min_quantity_required} items in your cart to use this product discount coupon."
            
        elif self.type == self.CouponType.MIN_PRODUCT_QUANTITY:
            # MIN_PRODUCT_QUANTITY: Check total items in cart
            if total_quantity < self.min_quantity_required:
                return False, f"This coupon requires at least {self.min_quantity_required} products in your cart. You currently have {total_quantity} items."
        
        elif self.type == self.CouponType.SHIPPING_DISCOUNT:
            # SHIPPING_DISCOUNT: Only apply to shipping amount
            # Check if minimum quantity is met for shipping discount eligibility
            if total_quantity < self.min_quantity_required:
                return False, f"You need at least {self.min_quantity_required} items in your cart to qualify for shipping discount. You currently have {total_quantity} items."
        
        elif self.type == self.CouponType.CART_TOTAL_DISCOUNT:
            # CART_TOTAL_DISCOUNT: Check minimum cart total requirement
            if cart_total is None:
                return False, "Cart total is required to validate this coupon."
            
            if self.min_cart_total and float(cart_total) < float(self.min_cart_total):
                return False, f"This coupon requires a minimum cart total of ${self.min_cart_total}. Your current total is ${cart_total}."
            
            # Also check minimum quantity if specified
            if total_quantity < self.min_quantity_required:
                return False, f"You need at least {self.min_quantity_required} items in your cart to use this coupon."
        
        elif self.type == self.CouponType.FIRST_TIME_USER:
            # FIRST_TIME_USER: Check if user has no previous orders
            if user is None:
                return False, "User authentication is required for this coupon."
            
            if user.orders.filter(status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']).exists():
                return False, "This coupon is only available for first-time customers."
            
            # Also check minimum quantity if specified
            if total_quantity < self.min_quantity_required:
                return False, f"You need at least {self.min_quantity_required} items in your cart to use this first-time user coupon."
        
        elif self.type == self.CouponType.USER_SPECIFIC:
            # USER_SPECIFIC: Check if user is in eligible users list
            if user is None:
                return False, "User authentication is required for this coupon."
            
            if not self.eligible_users.filter(id=user.id).exists():
                return False, "This coupon is not available for your account."
            
            # Also check minimum quantity if specified
            if total_quantity < self.min_quantity_required:
                return False, f"You need at least {self.min_quantity_required} items in your cart to use this coupon."
        
        # If all validations pass
        return True, "Coupon is valid and can be applied."
    
    def calculate_discount(self, cart_total, shipping_cost=0):
        """
        Calculate the discount amount based on coupon type
        
        Args:
            cart_total: Total cart value
            shipping_cost: Shipping cost
            
        Returns:
            dict: {'product_discount': amount, 'shipping_discount': amount}
        """
        discount_amount = float(self.discount_percent) / 100
        
        if self.type == self.CouponType.PRODUCT_DISCOUNT:
            return {
                'product_discount': float(cart_total) * discount_amount,
                'shipping_discount': 0
            }
        elif self.type == self.CouponType.MIN_PRODUCT_QUANTITY:
            return {
                'product_discount': float(cart_total) * discount_amount,
                'shipping_discount': 0
            }
        elif self.type == self.CouponType.SHIPPING_DISCOUNT:
            return {
                'product_discount': 0,
                'shipping_discount': float(shipping_cost) * discount_amount
            }
        elif self.type == self.CouponType.CART_TOTAL_DISCOUNT:
            return {
                'product_discount': float(cart_total) * discount_amount,
                'shipping_discount': 0
            }
        elif self.type == self.CouponType.FIRST_TIME_USER:
            # First time user discount applies to cart total
            return {
                'product_discount': float(cart_total) * discount_amount,
                'shipping_discount': 0
            }
        elif self.type == self.CouponType.USER_SPECIFIC:
            # User specific discount applies to cart total
            return {
                'product_discount': float(cart_total) * discount_amount,
                'shipping_discount': 0
            }
        
        return {'product_discount': 0, 'shipping_discount': 0}

class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Confirmation'
        PROCESSING = 'PROCESSING', 'Processing'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Failed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    cart_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Subtotal before shipping and discounts")
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    shipping_address = models.ForeignKey(Address, on_delete=models.PROTECT, help_text="Required shipping address")
    shipping_method = models.ForeignKey(ShippingMethod, on_delete=models.PROTECT, help_text="Required shipping method")
    tracking_number = models.CharField(max_length=100, help_text="Required tracking number for order tracking")
    
    # Required customer information fields
    customer_name = models.CharField(max_length=100, help_text="Required customer name")
    customer_email = models.EmailField(help_text="Required customer email")
    customer_phone = models.CharField(max_length=50, help_text="Required customer phone number")
    
    ordered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.order_number)
    
    def save(self, *args, **kwargs):
        # Generate a human-readable order number if not set
        if not self.order_number or str(self.order_number).startswith('uuid'):
            import datetime
            now = datetime.datetime.now()
            self.order_number = f"ORD-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"

class OrderUpdate(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='updates')
    status = models.CharField(max_length=20, choices=Order.OrderStatus.choices)
    notes = models.TextField(blank=True, null=True, help_text="e.g., 'Package has left the warehouse.'")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Update for {self.order.order_number} at {self.timestamp}"

class OrderPayment(models.Model):
    class PaymentMethod(models.TextChoices):
        BKASH = 'bkash', 'bKash'
        NAGAD = 'nagad', 'Nagad'
        CARD = 'card', 'Card'

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    admin_account_number = models.CharField(max_length=50, help_text="Required backend-set account number")
    sender_number = models.CharField(max_length=50, help_text="Required customer's payment number")
    transaction_id = models.CharField(max_length=100, help_text="Required transaction/Reference ID")
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order Payment"
        verbose_name_plural = "Order Payments"

    def __str__(self):
        return f"Payment for {self.order.order_number} - {self.get_payment_method_display()}"
