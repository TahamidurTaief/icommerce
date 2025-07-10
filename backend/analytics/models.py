from django.db import models
from core.models import UUIDModel
from users.models import User
from products.models import Product

class SearchLog(UUIDModel):
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    query = models.CharField(max_length=255)
    searched_at = models.DateTimeField(auto_now_add=True)
    result_count = models.PositiveIntegerField(default=0)
    device_info = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['-searched_at']

    def __str__(self):
        return f"Search for '{self.query}' by {self.user.email if self.user else 'anonymous'}"

class ProductViewLog(UUIDModel):
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='view_logs'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    viewed_at = models.DateTimeField(auto_now_add=True)
    device_info = models.JSONField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-viewed_at']

    def __str__(self):
        return f"View of {self.product.name} by {self.user.email if self.user else 'anonymous'}"

class DailySalesReport(UUIDModel):
    date = models.DateField(unique=True)
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0
    )
    top_selling_product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Daily Sales Report"
        verbose_name_plural = "Daily Sales Reports"

    def __str__(self):
        return f"Sales Report for {self.date}"