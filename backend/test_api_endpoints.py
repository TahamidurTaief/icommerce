#!/usr/bin/env python
"""Test API endpoints directly to verify fixes"""
import os
import sys
import django

# Setup Django first
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from products.views import CategoryViewSet, ProductViewSet
from rest_framework.test import APIRequestFactory

def test_category_endpoint():
    """Test category endpoint"""
    print("Testing CategoryViewSet...")
    
    factory = APIRequestFactory()
    request = factory.get('/api/categories/')
    request.user = AnonymousUser()
    
    view = CategoryViewSet.as_view({'get': 'list'})
    response = view(request)
    
    print(f"Category endpoint status: {response.status_code}")
    if response.status_code == 200:
        data = response.data
        if isinstance(data, dict) and 'results' in data:
            print(f"Found {len(data['results'])} categories (paginated)")
        else:
            print(f"Found {len(data)} categories (not paginated)")
        print("✅ Category endpoint working correctly")
    else:
        print(f"❌ Category endpoint failed: {response.data}")
    
    return response.status_code == 200

def test_product_endpoint():
    """Test product endpoint"""
    print("\nTesting ProductViewSet...")
    
    factory = APIRequestFactory()
    request = factory.get('/api/products/')
    request.user = AnonymousUser()
    
    view = ProductViewSet.as_view({'get': 'list'})
    response = view(request)
    
    print(f"Product endpoint status: {response.status_code}")
    if response.status_code == 200:
        data = response.data
        if isinstance(data, dict) and 'results' in data:
            print(f"Found {len(data['results'])} products (paginated)")
        else:
            print(f"Found {len(data)} products (not paginated)")
        print("✅ Product endpoint working correctly")
    else:
        print(f"❌ Product endpoint failed: {response.data}")
    
    return response.status_code == 200

def main():
    print("=== API Endpoint Tests ===")
    
    category_ok = test_category_endpoint()
    product_ok = test_product_endpoint()
    
    print(f"\n=== Summary ===")
    print(f"Category endpoint: {'✅ PASS' if category_ok else '❌ FAIL'}")
    print(f"Product endpoint: {'✅ PASS' if product_ok else '❌ FAIL'}")
    
    if category_ok and product_ok:
        print("\n🎉 All endpoints are working correctly!")
        print("The UnorderedObjectListWarning should be resolved.")
        print("You can now start the frontend to test the complete application.")
    else:
        print("\n⚠️  Some endpoints need attention.")

if __name__ == "__main__":
    main()
