#!/usr/bin/env python
import os
import django
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test.client import Client
from django.urls import reverse
import json

def test_endpoint_with_client():
    """Test the endpoint using Django test client"""
    try:
        print("Testing with Django Test Client...")
        client = Client()
        
        # Test cases
        test_cases = [
            {},  # No parameters
            {'page_size': '12'},  # Original failing case
            {'page_size': '5'},
            {'page_size': '1'},
            {'page_size': '12', 'min_price': '10'},
            {'page_size': '12', 'ordering': 'price'},
            {'page_size': '12', 'category': 'clothing'},
        ]
        
        for i, params in enumerate(test_cases):
            print(f"\nTest {i+1}: {params}")
            try:
                response = client.get('/api/products/', params)
                print(f"  Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if 'results' in data:
                        print(f"  Products returned: {len(data['results'])}")
                        print(f"  Total count: {data.get('count', 'N/A')}")
                        if len(data['results']) > 0:
                            first_product = data['results'][0]
                            print(f"  First product: {first_product.get('name', 'N/A')} - ${first_product.get('price', 'N/A')}")
                    else:
                        print(f"  Products returned: {len(data)}")
                    print(f"  ✓ Success")
                else:
                    print(f"  ✗ Error: {response.content.decode()}")
                    
            except Exception as e:
                print(f"  ✗ Error: {e}")
                import traceback
                traceback.print_exc()
                
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Testing Products API Endpoint with Django Test Client...")
    print("=" * 60)
    
    test_endpoint_with_client()
    
    print("=" * 60)
    print("✓ Test completed. If all tests passed, the endpoint should work fine!")
    print("\nTo start the server and test manually:")
    print("  python manage.py runserver 8000")
    print("  Then visit: http://127.0.0.1:8000/api/products/?page_size=12")
