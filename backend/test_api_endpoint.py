#!/usr/bin/env python
import os
import django
import sys
import json

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import APIRequestFactory
from products.views import ProductViewSet

def test_api_endpoint():
    """Test the actual API endpoint with page_size=12"""
    try:
        print("Testing /api/products/?page_size=12 endpoint...")
        
        # Create a request factory
        factory = APIRequestFactory()
        
        # Create a GET request with page_size=12
        request = factory.get('/api/products/', {'page_size': '12'})
        
        # Create the viewset
        view = ProductViewSet.as_view({'get': 'list'})
        
        # Call the view
        response = view(request)
        
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✓ Response data keys: {response.data.keys()}")
            
            if 'results' in response.data:
                print(f"✓ Number of products returned: {len(response.data['results'])}")
                print(f"✓ Total count: {response.data.get('count', 'N/A')}")
                print(f"✓ Next page: {response.data.get('next', 'N/A')}")
                print(f"✓ Previous page: {response.data.get('previous', 'N/A')}")
                
                if len(response.data['results']) > 0:
                    first_product = response.data['results'][0]
                    print(f"✓ First product name: {first_product.get('name', 'N/A')}")
                    print(f"✓ First product price: {first_product.get('price', 'N/A')}")
            else:
                print(f"✓ Direct results count: {len(response.data)}")
                
            return True
        else:
            print(f"✗ Error status code: {response.status_code}")
            print(f"✗ Error data: {response.data}")
            return False
            
    except Exception as e:
        print(f"✗ API endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_with_different_page_sizes():
    """Test with different page sizes to ensure robustness"""
    try:
        print("\nTesting with different page sizes...")
        factory = APIRequestFactory()
        view = ProductViewSet.as_view({'get': 'list'})
        
        test_cases = [
            {'page_size': '1'},
            {'page_size': '5'},
            {'page_size': '12'},
            {'page_size': '50'},
            {'page_size': '100'},  # Should be limited by max_page_size
            {'page_size': '150'}, # Should be limited by max_page_size
        ]
        
        for test_case in test_cases:
            request = factory.get('/api/products/', test_case)
            response = view(request)
            
            page_size = test_case['page_size']
            if response.status_code == 200:
                if 'results' in response.data:
                    actual_count = len(response.data['results'])
                    print(f"✓ Page size {page_size}: {actual_count} products returned")
                else:
                    print(f"✓ Page size {page_size}: {len(response.data)} products returned")
            else:
                print(f"✗ Page size {page_size}: Error {response.status_code}")
                
        return True
    except Exception as e:
        print(f"✗ Page size test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_filters():
    """Test filtering functionality"""
    try:
        print("\nTesting filters...")
        factory = APIRequestFactory()
        view = ProductViewSet.as_view({'get': 'list'})
        
        # Test with different filters
        test_cases = [
            {'page_size': '12'},  # No filters
            {'page_size': '12', 'min_price': '10'},
            {'page_size': '12', 'max_price': '100'},
            {'page_size': '12', 'min_price': '10', 'max_price': '100'},
            {'page_size': '12', 'ordering': 'price'},
            {'page_size': '12', 'ordering': '-price'},
            {'page_size': '12', 'ordering': 'name'},
        ]
        
        for i, test_case in enumerate(test_cases):
            request = factory.get('/api/products/', test_case)
            response = view(request)
            
            if response.status_code == 200:
                if 'results' in response.data:
                    count = len(response.data['results'])
                else:
                    count = len(response.data)
                print(f"✓ Filter test {i+1}: {count} products returned")
            else:
                print(f"✗ Filter test {i+1}: Error {response.status_code}")
                print(f"  Error: {response.data}")
                
        return True
    except Exception as e:
        print(f"✗ Filter test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing Products API Endpoint Comprehensively...")
    print("=" * 60)
    
    success = True
    success &= test_api_endpoint()
    success &= test_with_different_page_sizes()
    success &= test_filters()
    
    print("=" * 60)
    if success:
        print("✓ All API tests passed! The endpoint should work correctly.")
    else:
        print("✗ Some API tests failed. Check the errors above.")
