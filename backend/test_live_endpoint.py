#!/usr/bin/env python
import requests
import json

def test_live_endpoint():
    """Test the live API endpoint"""
    try:
        base_url = "http://127.0.0.1:8000"
        endpoint = f"{base_url}/api/products/"
        
        print(f"Testing live endpoint: {endpoint}")
        
        # Test cases
        test_cases = [
            {},  # No parameters
            {'page_size': '12'},  # Original failing case
            {'page_size': '5'},
            {'page_size': '1'},
            {'page_size': '12', 'min_price': '10'},
            {'page_size': '12', 'ordering': 'price'},
        ]
        
        for i, params in enumerate(test_cases):
            print(f"\nTest {i+1}: {params}")
            try:
                response = requests.get(endpoint, params=params, timeout=10)
                print(f"  Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if 'results' in data:
                        print(f"  Products returned: {len(data['results'])}")
                        print(f"  Total count: {data.get('count', 'N/A')}")
                    else:
                        print(f"  Products returned: {len(data)}")
                    print(f"  ✓ Success")
                else:
                    print(f"  ✗ Error: {response.text}")
                    
            except requests.exceptions.ConnectionError:
                print(f"  ✗ Connection Error - Server not running?")
            except requests.exceptions.Timeout:
                print(f"  ✗ Timeout Error")
            except Exception as e:
                print(f"  ✗ Error: {e}")
                
    except Exception as e:
        print(f"✗ Test failed: {e}")

if __name__ == "__main__":
    print("Testing Live Products API Endpoint...")
    print("=" * 50)
    print("Make sure Django server is running on http://127.0.0.1:8000")
    print("Run: python manage.py runserver 8000")
    print("=" * 50)
    
    test_live_endpoint()
