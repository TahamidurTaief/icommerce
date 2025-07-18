# shops/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from .models import Shop

@admin.register(Shop)
class ShopAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('name', 'owner', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'owner__email', 'slug')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('name',)}