# products/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from .models import *

@admin.register(Color)
class ColorAdmin(ModelAdmin):
    list_display = ('name', 'hex_code')
    search_fields = ('name',)

@admin.register(Size)
class SizeAdmin(ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(SubCategory)
class SubCategoryAdmin(ModelAdmin):
    list_display = ('name', 'category', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class ProductSpecificationInline(TabularInline):
    model = ProductSpecification
    extra = 1

class ProductAdditionalImageInline(TabularInline):
    model = ProductAdditionalImage
    extra = 1

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ('name', 'shop', 'price', 'stock', 'is_active')
    list_filter = ('is_active', 'shop', 'colors', 'sizes')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductSpecificationInline, ProductAdditionalImageInline]
    filter_horizontal = ('colors', 'sizes')
