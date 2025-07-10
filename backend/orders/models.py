from django.db import models
from django.core.validators import MinValueValidator
from core.models import UUIDModel
from users.models import User, Address
from products.models import Product, ProductVariant

class Order(UUIDModel):
    ORDER_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_METHODS = (
        ('cod', 'Cash on Delivery'),
        ('card', 'Credit/Debit Card'),
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('rocket', 'Rocket'),
    )

    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='orders'
    )
    order_number = models.CharField(max_length=20, unique=True)
    total_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20, 
        choices=ORDER_STATUS, 
        default='pending'
    )
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS, 
        default='pending'
    )
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHODS, 
        default='cod'
    )
    shipping_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='shipping_orders'
    )
    billing_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='billing_orders'
    )
    ordered_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-ordered_at']

    def __str__(self):
        return f"Order #{self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            last_order = Order.objects.order_by('-ordered_at').first()
            last_id = int(last_order.order_number[1:]) if last_order else 0
            self.order_number = f"O{str(last_id + 1).zfill(5)}"
        super().save(*args, **kwargs)

class OrderItem(UUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    selected_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order #{self.order.order_number})"