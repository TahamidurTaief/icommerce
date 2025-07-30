# orders/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.filters.admin import RangeDateFilter, RelatedDropdownFilter
from .models import Order, OrderItem


admin.site.register(Order, ImportExportModelAdmin)
admin.site.register(OrderItem, ImportExportModelAdmin)
# class OrderItemInline(TabularInline):
#     model = OrderItem
#     extra = 0
#     readonly_fields = ('product', 'quantity', 'unit_price')
#     can_delete = False # Disallow deleting items from an order

#     def has_add_permission(self, request, obj=None):
#         return False

# @admin.register(Order)
# class OrderAdmin(ImportExportModelAdmin, ModelAdmin):
#     list_display = ('order_number', 'user', 'total_amount', 'status', 'payment_status', 'ordered_at')
#     list_filter = ('status', 'payment_status', ('ordered_at', RangeDateFilter))
#     search_fields = ('order_number', 'user__email')
#     ordering = ('-ordered_at',)
#     inlines = [OrderItemInline]

# @admin.register(OrderItem)
# class OrderItemAdmin(ImportExportModelAdmin, ModelAdmin):
#     list_display = ('order', 'product', 'quantity', 'unit_price')
#     search_fields = ('order__order_number', 'product__name')