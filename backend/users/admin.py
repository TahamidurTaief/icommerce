# users/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from .models import User, Address

@admin.register(User)
class UserAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('email', 'full_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active')
    list_filter_submit = True # Adds a "Submit" button to the filter
    search_fields = ('email', 'full_name')
    ordering = ('-date_joined',)

@admin.register(Address)
class AddressAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('user', 'address_line', 'city', 'state', 'country')
    list_filter = ('city', 'state', 'country')
    search_fields = ('user__email', 'address_line', 'city')
    ordering = ('user',)