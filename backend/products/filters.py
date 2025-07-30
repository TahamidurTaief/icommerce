# backend/products/filters.py

from django_filters import rest_framework as filters
from .models import Product

# Custom filter to handle comma-separated values for multi-select filters
class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    """
    Enables filtering by a comma-separated list of character values.
    Example: ?brands=shop-a,shop-b
    """
    pass

class ProductFilter(filters.FilterSet):
    """
    Defines the filter set for the Product model, connecting URL query parameters
    to queryset filtering logic.
    """
    # Allows filtering by a single category slug (e.g., ?category=electronics)
    category = filters.CharFilter(field_name='sub_category__category__slug')

    # Allows filtering by one or more shop slugs (mapped from 'brands' in the frontend)
    brands = CharInFilter(field_name='shop__slug', lookup_expr='in')

    # Allows filtering by one or more color values
    colors = CharInFilter(field_name='specifications__value', lookup_expr='in')

    # Standard price range filters
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    # Ordering filter for sorting results
    ordering = filters.OrderingFilter(
        fields=(
            ('price', 'price'),
            ('name', 'name'),
            ('created_at', 'created_at'),
        )
    )

    class Meta:
        model = Product
        # Note: 'brands' and 'colors' are custom and map to the fields defined above.
        fields = ['category', 'brands', 'colors', 'min_price', 'max_price', 'ordering']

    def filter_queryset(self, queryset):
        """
        Overrides the default filter method to add specific logic for color filtering.
        """
        # First, apply all standard filters defined in this class
        queryset = super().filter_queryset(queryset)

        # If 'colors' are specified in the query params, we add an extra condition
        # to ensure we only match values from specifications where the name is 'Color'. 
        if 'colors' in self.request.query_params:
            queryset = queryset.filter(specifications__name__iexact='Color').distinct()
        
        return queryset
