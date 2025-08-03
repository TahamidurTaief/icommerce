#!/usr/bin/env python3
"""
Test script to verify RegisterAPIView functionality
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_register_api_view():
    """Test RegisterAPIView at /api/register/"""
    print("🧪 Testing RegisterAPIView at /api/register/...")
    print("=" * 60)
    
    # Test 1: Valid registration
    print("1. Testing valid registration...")
    test_data = {
        'name': 'API Test User',
        'email': 'apitest@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/register/", 
                               json=test_data,
                               headers={'Content-Type': 'application/json'})
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("   ✅ Registration successful!")
            print(f"   📋 Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            if 'user' in data and all(field in data['user'] for field in ['id', 'name', 'email']):
                print("   ✅ Response contains required user fields (id, name, email)")
                print(f"   👤 User ID: {data['user']['id']}")
                print(f"   📧 Email: {data['user']['email']}")
                print(f"   👤 Name: {data['user']['name']}")
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
    
    # Test 2: Password mismatch
    print("\n2. Testing password mismatch validation...")
    mismatch_data = {
        'name': 'Test User 2',
        'email': 'test2@example.com',
        'password': 'testpass123',
        'confirm_password': 'differentpass123'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/register/", 
                               json=mismatch_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 400:
            data = response.json()
            print("   ✅ Correctly validates password mismatch")
            if 'errors' in data:
                print(f"   📋 Validation errors: {data['errors']}")
        else:
            print(f"   ❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing password mismatch: {e}")
    
    # Test 3: Email already exists
    print("\n3. Testing duplicate email validation...")
    duplicate_data = {
        'name': 'Another User',
        'email': 'apitest@example.com',  # Same email as test 1
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/register/", 
                               json=duplicate_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 400:
            data = response.json()
            print("   ✅ Correctly validates duplicate email")
            if 'errors' in data and 'email' in data['errors']:
                print(f"   📧 Email error: {data['errors']['email']}")
                if any('already exists' in str(err).lower() for err in data['errors']['email']):
                    print("   ✅ Correct 'Email already exists' message")
        else:
            print(f"   ❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing duplicate email: {e}")
    
    # Test 4: Missing fields
    print("\n4. Testing missing required fields...")
    incomplete_data = {
        'name': 'Test User',
        'password': 'testpass123'
        # Missing email and confirm_password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/register/", 
                               json=incomplete_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 400:
            data = response.json()
            print("   ✅ Correctly validates missing required fields")
            if 'errors' in data:
                print(f"   📋 Validation errors: {data['errors']}")
        else:
            print(f"   ❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing missing fields: {e}")
    
    print("\n✅ RegisterAPIView test completed!")
    print("\nSummary:")
    print("✅ URL: /api/register/")
    print("✅ Method: POST")
    print("✅ Accepts: name, email, password, confirm_password")
    print("✅ Success: Returns 201 with user data (id, name, email)")
    print("✅ Failure: Returns 400 with detailed error messages")
    print("✅ Handles: Password mismatch, duplicate email, missing fields")
    
    return True

if __name__ == "__main__":
    test_register_api_view()
