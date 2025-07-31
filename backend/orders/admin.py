
# ===================================================================
# orders/admin.py

from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Order, OrderItem, ShippingMethod, OrderUpdate

@admin.register(ShippingMethod)
class ShippingMethodAdmin(ModelAdmin):
    list_display = ('name', 'price', 'is_active')
    list_filter = ('is_active',)

class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'color', 'size', 'quantity', 'unit_price')
    can_delete = False
    def has_add_permission(self, request, obj=None): return False

class OrderUpdateInline(TabularInline):
    model = OrderUpdate
    extra = 1
    readonly_fields = ('timestamp',)

@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ('order_number', 'user', 'total_amount', 'status', 'payment_status', 'ordered_at')
    list_filter = ('status', 'payment_status', 'shipping_method')
    search_fields = ('order_number', 'user__email', 'tracking_number')
    inlines = [OrderItemInline, OrderUpdateInline]
    readonly_fields = ('user', 'total_amount', 'shipping_address', 'shipping_method', 'ordered_at', 'order_number')
