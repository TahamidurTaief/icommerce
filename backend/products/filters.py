# products/filters.py
from django_filters import rest_framework as filters
from .models import Product

class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    pass

class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(field_name='sub_category__category__slug')
    brands = CharInFilter(field_name='shop__slug', lookup_expr='in')
    colors = CharInFilter(field_name='specifications__value', lookup_expr='in')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    ordering = filters.OrderingFilter(
        fields=(
            ('price', 'price'),
            ('name', 'name'),
            ('created_at', 'created_at'),
        )
    )

    class Meta:
        model = Product
        fields = ['category', 'brands', 'colors', 'min_price', 'max_price', 'ordering']

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        if 'colors' in self.request.query_params:
            queryset = queryset.filter(specifications__name__iexact='Color').distinct()
        return queryset