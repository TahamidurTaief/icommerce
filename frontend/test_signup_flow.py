#!/usr/bin/env python3
"""
Test script to verify frontend signup functionality with the backend
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_signup_flow():
    """Test the complete signup flow that the frontend will use"""
    print("🧪 Testing Frontend Signup Flow...")
    print("=" * 60)
    
    # Test data that the frontend will send
    signup_data = {
        "name": "Frontend Test User",
        "email": "frontend.test@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    print("1. Testing signup API endpoint...")
    print(f"POST {BASE_URL}/api/register/")
    print(f"Data: {json.dumps(signup_data, indent=2)}")
    
    try:
        # Clear any existing user first
        requests.delete(f"{BASE_URL}/api/register/", json={"email": signup_data["email"]})
        
        response = requests.post(f"{BASE_URL}/api/register/", 
                               json=signup_data,
                               headers={'Content-Type': 'application/json'})
        
        print(f"\nResponse Status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Signup successful!")
            print("Response:")
            print(json.dumps(data, indent=2))
            
            if 'user' in data and all(field in data['user'] for field in ['id', 'name', 'email']):
                print("\n✅ Response structure correct for frontend")
                
                # Test 2: Auto-login after signup
                print("\n2. Testing auto-login after signup...")
                login_data = {
                    "email": signup_data["email"],
                    "password": signup_data["password"]
                }
                
                login_response = requests.post(f"{BASE_URL}/api/token/", 
                                             json=login_data,
                                             headers={'Content-Type': 'application/json'})
                
                if login_response.status_code == 200:
                    login_data = login_response.json()
                    print("✅ Auto-login successful!")
                    print("Login Response:")
                    print(json.dumps(login_data, indent=2))
                    
                    if all(field in login_data for field in ['access', 'refresh', 'user']):
                        print("\n✅ Login response has all required fields")
                    else:
                        print("\n❌ Login response missing required fields")
                else:
                    print(f"\n❌ Auto-login failed: {login_response.status_code}")
                    print(login_response.text)
                    
            else:
                print("\n❌ Signup response structure incorrect")
                
        elif response.status_code == 400:
            data = response.json()
            print("❌ Signup failed (validation error)")
            print("Response:")
            print(json.dumps(data, indent=2))
            
            if 'errors' in data:
                print("\n✅ Error structure correct for frontend error handling")
            else:
                print("\n⚠️  Error structure may need adjustment")
                
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Server not running. Start with: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 3: Test field validation errors
    print("\n3. Testing field validation errors...")
    invalid_data = {
        "name": "",  # Missing name
        "email": "invalid-email",  # Invalid email
        "password": "123",  # Too short password
        "confirm_password": "456"  # Password mismatch
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/register/", 
                               json=invalid_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 400:
            data = response.json()
            print("✅ Validation errors handled correctly")
            print("Error Response:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing validation: {e}")
    
    print("\n📋 Frontend Integration Summary:")
    print("✅ Signup modal should POST to /api/register/")
    print("✅ Include fields: name, email, password, confirm_password")
    print("✅ On success: show success modal and auto-login")
    print("✅ On failure: show error modal with field errors")
    print("✅ After success: redirect to home page (/)")
    
    return True

if __name__ == "__main__":
    test_signup_flow()
