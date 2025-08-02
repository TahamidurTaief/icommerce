# users/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'CUSTOMER')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('SELLER', 'Seller'),
        ('ADMIN', 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='CUSTOMER'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    # Legacy fields for compatibility (can be removed if not needed)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, verbose_name="State / Province / Region")
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Addresses"
        
    def __str__(self):
        return f"{self.address_line_1}, {self.city}"
