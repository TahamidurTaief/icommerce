from django.db import models
from core.models import UUIDModel
from orders.models import Order
from users.models import User

class Payment(UUIDModel):
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_METHODS = (
        ('card', 'Credit/Debit Card'),
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('rocket', 'Rocket'),
    )

    order = models.ForeignKey(
        Order, 
        on_delete=models.PROTECT, 
        related_name='payments'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2
    )
    method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHODS
    )
    status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS, 
        default='pending'
    )
    transaction_id = models.CharField(
        max_length=100, 
        unique=True
    )
    payment_details = models.JSONField(
        blank=True, 
        null=True
    )
    paid_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['-paid_at']

    def __str__(self):
        return f"Payment {self.transaction_id} for Order #{self.order.order_number}"