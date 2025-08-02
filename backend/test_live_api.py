#!/usr/bin/env python
import requests
import json
import time

def test_live_endpoints():
    """Test all live API endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    endpoints = [
        ('/api/products/', 'Products'),
        ('/api/products/?page_size=12', 'Products with page_size=12'),
        ('/api/categories/', 'Categories'),
        ('/api/subcategories/', 'SubCategories'),
        ('/api/colors/', 'Colors'),
        ('/api/sizes/', 'Sizes'),
        ('/api/shops/', 'Shops'),
    ]
    
    print("Testing Live API Endpoints...")
    print("=" * 60)
    print("Make sure Django server is running: python manage.py runserver 8000")
    print("=" * 60)
    
    for endpoint, name in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"\n🔍 Testing {name}")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict) and 'results' in data:
                        count = len(data['results'])
                        total = data.get('count', 'N/A')
                        print(f"   Results: {count} items (Total: {total})")
                        if count > 0:
                            first_item = data['results'][0]
                            name_field = first_item.get('name', first_item.get('id', 'N/A'))
                            print(f"   First item: {name_field}")
                    elif isinstance(data, list):
                        count = len(data)
                        print(f"   Results: {count} items")
                        if count > 0:
                            first_item = data[0]
                            name_field = first_item.get('name', first_item.get('id', 'N/A'))
                            print(f"   First item: {name_field}")
                    print(f"   ✅ SUCCESS")
                except json.JSONDecodeError:
                    print(f"   ❌ Invalid JSON response")
            else:
                print(f"   ❌ FAILED - Status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")
                    
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR - Server not running?")
        except requests.exceptions.Timeout:
            print(f"   ❌ TIMEOUT ERROR")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            
        time.sleep(0.5)  # Small delay between requests
    
    print("\n" + "=" * 60)
    print("✅ Testing completed!")
    print("\nIf all endpoints show SUCCESS, your API is working correctly!")
    print("\nNext steps:")
    print("1. Use these endpoints in your frontend application")
    print("2. Test with different parameters like filtering and pagination")
    print("3. Monitor the debug.log file for any issues")

if __name__ == "__main__":
    test_live_endpoints()
