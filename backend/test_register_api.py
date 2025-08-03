#!/usr/bin/env python3
"""
Test script to verify RegisterSerializer API endpoint
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_register_api():
    """Test RegisterSerializer API endpoint"""
    print("🧪 Testing RegisterSerializer API Endpoint...")
    print("=" * 60)
    
    # Test data
    test_data = {
        'name': 'API Test User',
        'email': 'apitest@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    print("1. Testing registration endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register-simple/", 
                               json=test_data,
                               headers={'Content-Type': 'application/json'})
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("   ✅ Registration successful!")
            print(f"   📋 Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            if 'user' in data and 'id' in data['user'] and 'name' in data['user'] and 'email' in data['user']:
                print("   ✅ Response contains required user fields (id, name, email)")
            else:
                print("   ⚠️  Response structure may be different than expected")
                
        elif response.status_code == 400:
            data = response.json()
            print("   ❌ Registration failed (validation error)")
            print(f"   📋 Errors: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Unexpected status code: {response.status_code}")
            print(f"   📋 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Server is not running. Please start the Django server first.")
        print("   💡 Run: python manage.py runserver")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test password mismatch
    print("\n2. Testing password mismatch validation...")
    mismatch_data = {
        'name': 'Test User 2',
        'email': 'test2@example.com',
        'password': 'testpass123',
        'confirm_password': 'differentpass123'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register-simple/", 
                               json=mismatch_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 400:
            print("   ✅ Correctly validates password mismatch")
        else:
            print(f"   ❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing password mismatch: {e}")
    
    print("\n✅ API test completed!")
    return True

if __name__ == "__main__":
    test_register_api()
