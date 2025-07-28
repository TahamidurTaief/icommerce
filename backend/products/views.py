# backend/products/views.py

from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination  # <-- এই লাইনটি যোগ করুন

from .models import Product, Category, SubCategory
from .serializers import ProductSerializer, CategorySerializer, SubCategorySerializer
from .permissions import IsShopOwnerOrReadOnly
from .filters import ProductFilter

# --- একটি কাস্টম পেজিনেশন ক্লাস তৈরি করুন ---
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # প্রতি পেজে ডিফল্ট প্রোডাক্ট সংখ্যা
    page_size_query_param = 'page_size'  # client থেকে প্রতি পেজে কয়টি প্রোডাক্ট দেখাবে তা নির্ধারণ করার জন্য
    max_page_size = 100 # সর্বোচ্চ প্রোডাক্ট সংখ্যা প্রতি পেজে

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsShopOwnerOrReadOnly]
    filterset_class = ProductFilter
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination  # <-- এই লাইনটি যোগ করুন

    def perform_create(self, serializer):
        serializer.save(shop=self.request.user.shop)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    lookup_field = 'slug'

