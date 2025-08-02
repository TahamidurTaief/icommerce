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
import json

def test_all_endpoints():
    """Test all API endpoints"""
    try:
        print("Testing All API Endpoints...")
        client = Client()
        
        endpoints = [
            ('/api/products/', 'Products'),
            ('/api/categories/', 'Categories'),
            ('/api/subcategories/', 'SubCategories'),
            ('/api/colors/', 'Colors'),
            ('/api/sizes/', 'Sizes'),
            ('/api/shops/', 'Shops'),
        ]
        
        for endpoint, name in endpoints:
            print(f"\n=== Testing {name} ({endpoint}) ===")
            try:
                response = client.get(endpoint)
                print(f"  Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if isinstance(data, dict) and 'results' in data:
                            print(f"  Items returned: {len(data['results'])}")
                            print(f"  Total count: {data.get('count', 'N/A')}")
                            if len(data['results']) > 0:
                                first_item = data['results'][0]
                                print(f"  First item: {first_item.get('name', first_item.get('id', 'N/A'))}")
                        elif isinstance(data, list):
                            print(f"  Items returned: {len(data)}")
                            if len(data) > 0:
                                first_item = data[0]
                                print(f"  First item: {first_item.get('name', first_item.get('id', 'N/A'))}")
                        else:
                            print(f"  Response type: {type(data)}")
                        print(f"  ✓ Success")
                    except json.JSONDecodeError:
                        print(f"  ✗ Invalid JSON response")
                        print(f"  Response: {response.content[:200]}")
                elif response.status_code == 403:
                    print(f"  ✗ Forbidden - Permission denied")
                    print(f"  Response: {response.content.decode()}")
                elif response.status_code == 401:
                    print(f"  ✗ Unauthorized - Authentication required")
                    print(f"  Response: {response.content.decode()}")
                else:
                    print(f"  ✗ Error: {response.status_code}")
                    print(f"  Response: {response.content.decode()}")
                    
            except Exception as e:
                print(f"  ✗ Exception: {e}")
                import traceback
                traceback.print_exc()
                
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()

def test_data_counts():
    """Check if we have data in the database"""
    try:
        print("\n=== Database Data Check ===")
        
        from products.models import Product, Category, SubCategory, Color, Size
        from shops.models import Shop
        
        models_to_check = [
            (Product, 'Products'),
            (Category, 'Categories'),
            (SubCategory, 'SubCategories'),
            (Color, 'Colors'),
            (Size, 'Sizes'),
            (Shop, 'Shops'),
        ]
        
        for model, name in models_to_check:
            try:
                count = model.objects.count()
                print(f"  {name}: {count} records")
                
                if count > 0:
                    first_item = model.objects.first()
                    item_name = getattr(first_item, 'name', getattr(first_item, 'id', 'Unknown'))
                    print(f"    First {name[:-1]}: {item_name}")
                    
            except Exception as e:
                print(f"  {name}: Error - {e}")
                
    except Exception as e:
        print(f"✗ Database check failed: {e}")

if __name__ == "__main__":
    print("Testing All API Endpoints and Database...")
    print("=" * 60)
    
    test_data_counts()
    test_all_endpoints()
    
    print("=" * 60)
    print("✓ Test completed!")
