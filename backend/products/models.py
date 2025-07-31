# products/models.py
import uuid
from django.db import models
from django.conf import settings
from shops.models import Shop
from ckeditor.fields import RichTextField

class Color(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="e.g., Red, Ocean Blue")
    hex_code = models.CharField(max_length=7, unique=True, help_text="e.g., #FF0000")

    def __str__(self):
        return self.name

class Size(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="e.g., S, M, L, XL, 42")

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    slug = models.SlugField(unique=True)
    class Meta:
        verbose_name_plural = "Categories"
    def __str__(self):
        return self.name

class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='subcategories/', blank=True, null=True)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    class Meta:
        unique_together = ('name', 'category')
    def __str__(self):
        return f"{self.name} ({self.category.name})"

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = RichTextField()
    sub_category = models.ForeignKey(SubCategory, on_delete=models.PROTECT, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    thumbnail = models.ImageField(upload_to='products/thumbnails/', blank=True, null=True)
    colors = models.ManyToManyField(Color, blank=True, related_name='products')
    sizes = models.ManyToManyField(Size, blank=True, related_name='products')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProductAdditionalImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='additional_images')
    image = models.ImageField(upload_to='products/additional_images/')
    class Meta:
        verbose_name_plural = "Product Additional Images"
    def __str__(self):
        return f"Image for {self.product.name}"

class ProductAdditionalDescription(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='additional_descriptions')
    description = RichTextField()
    def __str__(self):
        return f"Additional description for {self.product.name}"

class ProductSpecification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    name = models.CharField(max_length=255, help_text="e.g., Material, Weight (Not for Color or Size)")
    value = models.CharField(max_length=255, help_text="e.g., Cotton, 250g")
    class Meta:
        unique_together = ('product', 'name')
    def __str__(self):
        return f"{self.name}: {self.value}"

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'product')
