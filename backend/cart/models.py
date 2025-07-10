from django.db import models
from core.models import UUIDModel
from users.models import User
from products.models import Product, ProductVariant

class Cart(UUIDModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    @property
    def total_items(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0

    @property
    def subtotal(self):
        return sum(
            item.quantity * (
                item.selected_variant.current_price if item.selected_variant 
                else item.product.current_price
            )
            for item in self.items.all()
        )

    def __str__(self):
        return f"Cart for {self.user.email}"

class CartItem(UUIDModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    selected_variant = models.ForeignKey(
        ProductVariant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product', 'selected_variant')
        ordering = ['-added_at']

    @property
    def unit_price(self):
        if self.selected_variant:
            return self.selected_variant.current_price
        return self.product.current_price

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Wishlist(UUIDModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.user.email}'s wishlist item: {self.product.name}"