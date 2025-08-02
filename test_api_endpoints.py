#!/usr/bin/env python3
"""
Test script to verify API endpoints for categories, shops, colors, and sizes
"""
import requests
import json

API_BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint_name, url):
    """Test a specific API endpoint"""
    print(f"\n🔍 Testing {endpoint_name}...")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Response type: {type(data)}")
            
            if isinstance(data, list):
                print(f"📊 Total items: {len(data)}")
                if data:
                    print(f"📝 First item keys: {list(data[0].keys())}")
                    print(f"📋 First item: {json.dumps(data[0], indent=2)}")
            elif isinstance(data, dict):
                print(f"📊 Response keys: {list(data.keys())}")
                if 'results' in data:
                    print(f"📊 Total results: {len(data['results'])}")
                    if data['results']:
                        print(f"📝 First result keys: {list(data['results'][0].keys())}")
                        print(f"📋 First result: {json.dumps(data['results'][0], indent=2)}")
                else:
                    print(f"📋 Response: {json.dumps(data, indent=2)}")
            
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error text: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed. Is the Django server running on {API_BASE_URL}?")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("🚀 Testing API Endpoints for Categories, Shops, Colors, and Sizes")
    print("=" * 70)
    
    endpoints_to_test = [
        ("Categories", f"{API_BASE_URL}/api/categories/"),
        ("Shops", f"{API_BASE_URL}/api/shops/"),
        ("Colors", f"{API_BASE_URL}/api/colors/"),
        ("Sizes", f"{API_BASE_URL}/api/sizes/"),
        ("Products (first 12)", f"{API_BASE_URL}/api/products/?page_size=12"),
    ]
    
    results = {}
    
    for endpoint_name, url in endpoints_to_test:
        results[endpoint_name] = test_endpoint(endpoint_name, url)
    
    print("\n" + "=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    
    for endpoint_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{endpoint_name}: {status}")
    
    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 All API endpoints are working correctly!")
    else:
        print("\n⚠️  Some API endpoints failed. Check the Django server logs for more details.")
    
    return all_passed

if __name__ == "__main__":
    main()
