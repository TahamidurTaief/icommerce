"""
Test script to verify the shipping methods API endpoint
"""

import requests
import json

def test_shipping_methods_api():
    try:
        # Test the shipping methods endpoint
        url = "http://localhost:8000/api/shipping-methods/"
        
        print("Testing shipping methods API endpoint...")
        print(f"URL: {url}")
        
        response = requests.get(url)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Found {len(data)} shipping methods:")
            
            for method in data:
                print(f"  - {method.get('name', 'No name')}: ${method.get('price', 'No price')}")
                print(f"    Description: {method.get('description', 'No description')}")
                print(f"    Active: {method.get('is_active', 'Unknown')}")
                print()
        else:
            print(f"Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server.")
        print("Make sure Django development server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_shipping_methods_api()
