#!/usr/bin/env python3
"""
Test script to verify JWT authentication setup
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_jwt_endpoints():
    """Test JWT token endpoints"""
    print("🧪 Testing JWT Authentication Setup...")
    print("=" * 50)
    
    # Test 1: Check if token endpoint is accessible
    print("1. Testing token endpoint accessibility...")
    try:
        response = requests.post(f"{BASE_URL}/api/token/", {
            "username": "test_user",
            "password": "test_password"
        })
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 400:
            print("   ✅ Token endpoint is accessible (expected 400 for invalid credentials)")
        else:
            print(f"   Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("   ❌ Server is not running. Please start the Django server first.")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 2: Check if token refresh endpoint is accessible
    print("\n2. Testing token refresh endpoint accessibility...")
    try:
        response = requests.post(f"{BASE_URL}/api/token/refresh/", {
            "refresh": "dummy_token"
        })
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Token refresh endpoint is accessible (expected 401 for invalid token)")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 3: Check protected endpoint without authentication
    print("\n3. Testing protected endpoint without authentication...")
    try:
        response = requests.get(f"{BASE_URL}/api/products/")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Protected endpoint correctly requires authentication")
        elif response.status_code == 200:
            print("   ⚠️  Endpoint accessible without authentication (check permissions)")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    print("\n✅ JWT Authentication setup test completed!")
    print("\nNext steps:")
    print("1. Create a user account to test actual token generation")
    print("2. Test authentication with valid credentials")
    print("3. Test protected endpoints with JWT tokens")
    
    return True

if __name__ == "__main__":
    test_jwt_endpoints()
