# shops/models.py
from django.db import models
from django.conf import settings

class Shop(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shop')
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='shops/logos/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='shops/covers/', blank=True, null=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Is the shop currently open for business?")
    is_verified = models.BooleanField(default=False, help_text="Has the shop been verified by the admin?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
