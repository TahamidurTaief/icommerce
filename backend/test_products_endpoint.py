#!/usr/bin/env python
import os
import django
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product, Category, SubCategory, Color, Size
from shops.models import Shop
from users.models import User
from django.db import connection

def test_database_connection():
    """Test if database connection works"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✓ Database connection successful: {result}")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def test_models():
    """Test if models can be queried"""
    try:
        # Test User model
        user_count = User.objects.count()
        print(f"✓ Users in database: {user_count}")
        
        # Test Shop model
        shop_count = Shop.objects.count()
        print(f"✓ Shops in database: {shop_count}")
        
        # Test Category model
        category_count = Category.objects.count()
        print(f"✓ Categories in database: {category_count}")
        
        # Test SubCategory model
        subcategory_count = SubCategory.objects.count()
        print(f"✓ SubCategories in database: {subcategory_count}")
        
        # Test Product model
        product_count = Product.objects.count()
        print(f"✓ Products in database: {product_count}")
        
        # Test active products
        active_product_count = Product.objects.filter(is_active=True).count()
        print(f"✓ Active products in database: {active_product_count}")
        
        # Test the exact queryset used in the view
        queryset = Product.objects.filter(is_active=True).select_related('shop', 'sub_category__category').prefetch_related('colors', 'sizes', 'reviews')
        optimized_count = queryset.count()
        print(f"✓ Optimized queryset count: {optimized_count}")
        
        return True
    except Exception as e:
        print(f"✗ Model query failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_pagination():
    """Test pagination with page_size=12"""
    try:
        from rest_framework.pagination import PageNumberPagination
        from products.views import StandardResultsSetPagination
        
        paginator = StandardResultsSetPagination()
        print(f"✓ Pagination class loaded. Page size: {paginator.page_size}, Max page size: {paginator.max_page_size}")
        
        queryset = Product.objects.filter(is_active=True)
        
        # Simulate request with page_size=12
        class MockRequest:
            def __init__(self):
                self.query_params = {'page_size': '12'}
        
        request = MockRequest()
        paginator.paginate_queryset(queryset, request)
        print(f"✓ Pagination test successful")
        
        return True
    except Exception as e:
        print(f"✗ Pagination test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_serializers():
    """Test if serializers work with sample data"""
    try:
        from products.serializers import ProductSerializer
        
        # Get first product if available
        products = Product.objects.filter(is_active=True)[:1]
        if products:
            product = products[0]
            
            # Test serialization
            class MockRequest:
                def build_absolute_uri(self, url):
                    return f"http://localhost:8000{url}"
            
            context = {'request': MockRequest()}
            serializer = ProductSerializer(product, context=context)
            data = serializer.data
            print(f"✓ Product serialization successful for: {product.name}")
            print(f"  - Serialized fields: {list(data.keys())}")
            return True
        else:
            print("ℹ No products found to test serialization")
            return True
    except Exception as e:
        print(f"✗ Serializer test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing Products Endpoint Components...")
    print("=" * 50)
    
    success = True
    success &= test_database_connection()
    success &= test_models()
    success &= test_pagination()
    success &= test_serializers()
    
    print("=" * 50)
    if success:
        print("✓ All tests passed! The endpoint should work.")
    else:
        print("✗ Some tests failed. Check the errors above.")
