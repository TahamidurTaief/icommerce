
# ===================================================================
# orders/admin.py

from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Order, OrderItem, ShippingMethod, OrderUpdate, OrderPayment, Coupon, ShippingTier

class ShippingTierInline(TabularInline):
    model = ShippingTier
    extra = 1
    fields = ('min_quantity', 'price')
    ordering = ['min_quantity']

@admin.register(ShippingMethod)
class ShippingMethodAdmin(ModelAdmin):
    list_display = ('name', 'price', 'delivery_estimated_time', 'is_active', 'tier_count')
    list_filter = ('is_active',)
    fields = ('name', 'description', 'price', 'delivery_estimated_time', 'is_active')
    inlines = [ShippingTierInline]
    
    def tier_count(self, obj):
        return obj.shipping_tiers.count()
    tier_count.short_description = 'Pricing Tiers'

@admin.register(ShippingTier)
class ShippingTierAdmin(ModelAdmin):
    list_display = ('shipping_method', 'min_quantity', 'price')
    list_filter = ('shipping_method',)
    ordering = ['shipping_method', 'min_quantity']

@admin.register(Coupon)
class CouponAdmin(ModelAdmin):
    list_display = ('code', 'type', 'discount_percent', 'min_quantity_required', 'min_cart_total', 'active', 'valid_from', 'expires_at', 'eligible_users_count')
    list_filter = ('type', 'active', 'created_at', 'valid_from', 'expires_at')
    search_fields = ('code',)
    readonly_fields = ('created_at',)
    filter_horizontal = ('eligible_users',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'type', 'active')
        }),
        ('Discount Settings', {
            'fields': ('discount_percent', 'min_quantity_required', 'min_cart_total')
        }),
        ('User Restrictions', {
            'fields': ('eligible_users',),
            'classes': ('collapse',),
            'description': 'Select specific users for USER_SPECIFIC coupon type'
        }),
        ('Validity Period', {
            'fields': ('created_at', 'valid_from', 'expires_at')
        }),
    )
    
    def eligible_users_count(self, obj):
        if obj.type == obj.CouponType.USER_SPECIFIC:
            return obj.eligible_users.count()
        return '-'
    eligible_users_count.short_description = 'Eligible Users'
    
    def get_queryset(self, request):
        """Add custom ordering and filters"""
        qs = super().get_queryset(request)
        return qs.select_related()

# Order Admin Configuration
class OrderItemInline(admin.TabularInline):
    """Inline for order items"""
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'color', 'size', 'quantity', 'unit_price')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

class OrderPaymentInline(admin.StackedInline):
    """Inline for order payment"""
    model = OrderPayment
    extra = 0
    readonly_fields = ('payment_method', 'sender_number', 'transaction_id', 'admin_account_number', 'created_at', 'updated_at')
    can_delete = False
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('payment_method', 'admin_account_number', 'sender_number', 'transaction_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request, obj=None):
        return False

class OrderUpdateInline(TabularInline):
    model = OrderUpdate
    extra = 1
    readonly_fields = ('timestamp',)

@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ('order_number', 'customer_name', 'customer_email', 'total_amount', 'payment_status', 'status', 'ordered_at')
    list_filter = ('status', 'payment_status', 'shipping_method', 'ordered_at')
    search_fields = ('order_number', 'customer_name', 'customer_email', 'customer_phone', 'tracking_number')
    readonly_fields = ('order_number', 'total_amount', 'cart_subtotal', 'ordered_at')
    inlines = [OrderItemInline, OrderPaymentInline, OrderUpdateInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'payment_status', 'ordered_at')
        }),
        ('Customer Information', {
            'fields': ('customer_name', 'customer_email', 'customer_phone')
        }),
        ('Shipping Information', {
            'fields': ('shipping_address', 'shipping_method', 'tracking_number')
        }),
        ('Financial Information', {
            'fields': ('cart_subtotal', 'total_amount'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with related objects"""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'shipping_method', 'shipping_address').prefetch_related('items', 'payment')

@admin.register(OrderPayment)
class OrderPaymentAdmin(ModelAdmin):
    list_display = ('order', 'payment_method', 'sender_number', 'transaction_id', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('order__order_number', 'sender_number', 'transaction_id', 'admin_account_number')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order',)
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'sender_number', 'transaction_id', 'admin_account_number')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
