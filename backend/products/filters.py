# backend/products/filters.py

from django_filters import rest_framework as filters
from .models import Product

class ProductFilter(filters.FilterSet):
    # category ফিল্টারটিকে নামের পরিবর্তে slug দিয়ে খোঁজার জন্য আপডেট করা হয়েছে
    category = filters.CharFilter(field_name='sub_category__category__slug')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    ordering = filters.OrderingFilter(
        fields=(
            ('price', 'price'),
            ('name', 'name'),
        )
    )

    class Meta:
        model = Product
        fields = ['category', 'min_price', 'max_price']
