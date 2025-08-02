"""
Test script to validate the enhanced order creation API
"""

import requests
import json

def test_order_creation_api():
    try:
        # Test the order creation endpoint with all enhanced fields
        url = "http://localhost:8000/api/orders/"
        
        # Sample order data with all the enhanced fields
        sample_order_data = {
            "total_amount": "112.98",
            "cart_subtotal": "99.99",
            "shipping_method": 1,  # Assuming shipping method ID 1 exists
            "shipping_address": None,  # Optional for testing
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+1234567890",
            "sender_number": "01712345678",
            "transaction_id": "TXN123456789",
            "payment_method": "bkash",
            "items": [
                {
                    "product": 1,  # Assuming product ID 1 exists
                    "quantity": 1,
                    "unit_price": "79.99"
                },
                {
                    "product": 2,  # Assuming product ID 2 exists
                    "quantity": 1,
                    "unit_price": "19.99"
                }
            ]
        }
        
        print("Testing enhanced order creation API...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(sample_order_data, indent=2)}")
        
        headers = {
            "Content-Type": "application/json",
            # Add authentication header here if needed
            # "Authorization": "Bearer YOUR_TOKEN_HERE"
        }
        
        response = requests.post(url, json=sample_order_data, headers=headers)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Order created successfully!")
            print(f"Order ID: {data.get('order_id')}")
            print(f"Order Number: {data.get('order_number')}")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server.")
        print("Make sure Django development server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_shipping_methods_first():
    """Test shipping methods endpoint to ensure we have data"""
    try:
        url = "http://localhost:8000/api/shipping-methods/"
        response = requests.get(url)
        
        if response.status_code == 200:
            methods = response.json()
            print(f"✅ Found {len(methods)} shipping methods:")
            for method in methods:
                print(f"  - ID: {method['id']}, Name: {method['name']}, Price: ${method['price']}")
            return len(methods) > 0
        else:
            print(f"❌ Failed to get shipping methods: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting shipping methods: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Enhanced Order Creation API\n")
    
    # First test shipping methods
    print("1. Testing shipping methods availability...")
    if test_shipping_methods_first():
        print("\n2. Testing order creation...")
        test_order_creation_api()
    else:
        print("\n❌ Cannot test order creation without shipping methods.")
        print("Please create shipping methods first using:")
        print("python manage.py create_shipping_methods")
