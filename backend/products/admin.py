# products/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RelatedDropdownFilter,
)
from .models import (
    Category, SubCategory, Product, ProductSpecification,
    Review, ProductAdditionalImage, ProductAdditionalDescription
)

@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(SubCategory)
class SubCategoryAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('name', 'category', 'slug')
    list_filter = (('category', RelatedDropdownFilter),) # Use a dropdown filter
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

# Use Unfold's Inlines
class ProductSpecificationInline(TabularInline):
    model = ProductSpecification
    extra = 1

class ProductAdditionalImageInline(TabularInline):
    model = ProductAdditionalImage
    extra = 1

class ProductAdditionalDescriptionInline(StackedInline):
    model = ProductAdditionalDescription
    extra = 1

@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('name', 'shop', 'sub_category', 'price', 'stock', 'is_active')
    list_filter = (
        'is_active',
        ('sub_category__category', RelatedDropdownFilter),
        ('shop', RelatedDropdownFilter),
        ('created_at', RangeDateFilter),
    )
    list_filter_submit = True
    search_fields = ('name', 'slug', 'shop__name')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [
        ProductSpecificationInline,
        ProductAdditionalImageInline,
        ProductAdditionalDescriptionInline
    ]

@admin.register(Review)
class ReviewAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', ('created_at', RangeDateFilter))
    search_fields = ('product__name', 'user__email')
    ordering = ('-created_at',)