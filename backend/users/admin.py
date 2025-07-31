from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from import_export.admin import ExportMixin
from import_export import resources

from unfold.admin import ModelAdmin
# from unfold.decorators import display_with_icon

from .models import User, Address

# ------------------------------
# User Resource for Import/Export
# ------------------------------
class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'phone', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login')
        export_order = fields

# ------------------------------
# User Admin
# ------------------------------
@admin.register(User)
class CustomUserAdmin(ExportMixin, ModelAdmin):
    resource_class = UserResource

    list_display = ('email', 'full_name', 'phone', 'is_active', 'is_staff', 'is_superuser')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-date_joined',)
    readonly_fields = ('last_login', 'date_joined')

    fieldsets = (
        (_('Credentials'), {'fields': ('email', 'password')}),
        (_('Personal Info'), {'fields': ('full_name', 'phone')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

# ------------------------------
# Address Resource for Import/Export
# ------------------------------
class AddressResource(resources.ModelResource):
    class Meta:
        model = Address
        fields = (
            'id', 'user__email', 'address_line_1', 'address_line_2',
            'city', 'state', 'postal_code', 'country', 'is_default'
        )
        export_order = fields

# ------------------------------
# Address Admin
# ------------------------------
@admin.register(Address)
class AddressAdmin(ExportMixin, ModelAdmin):
    resource_class = AddressResource

    list_display = ('user', 'address_line_1', 'city', 'state', 'country', 'is_default')
    list_filter = ('city', 'state', 'country', 'is_default')
    search_fields = ('user__email', 'address_line_1', 'city', 'postal_code', 'country')

    autocomplete_fields = ('user',)
