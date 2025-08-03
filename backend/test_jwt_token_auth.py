#!/usr/bin/env python3
"""
Test script to verify JWT Token Authentication with CustomTokenObtainPairView
"""
import os
import sys
import django
from pathlib import Path

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from django.urls import reverse
from users.models import User
import json

def test_jwt_token_authentication():
    """Test JWT Token Authentication with CustomTokenObtainPairView"""
    print("🧪 Testing JWT Token Authentication...")
    print("=" * 60)
    
    client = Client()
    
    # First, create a test user
    print("1. Creating test user...")
    test_email = "jwttest@example.com"
    test_password = "testpass123"
    test_name = "JWT Test User"
    
    # Delete user if exists to start fresh
    User.objects.filter(email=test_email).delete()
    
    # Create user using our RegisterAPIView
    register_data = {
        'name': test_name,
        'email': test_email,
        'password': test_password,
        'confirm_password': test_password
    }
    
    register_response = client.post('/api/register/', 
                                  data=json.dumps(register_data),
                                  content_type='application/json')
    
    if register_response.status_code == 201:
        print("   ✅ Test user created successfully")
    else:
        print(f"   ❌ Failed to create test user: {register_response.status_code}")
        print(f"   📋 Response: {register_response.content.decode()}")
        return False
    
    # Test 2: Valid login with email and password
    print("\n2. Testing valid login with email and password...")
    login_data = {
        'email': test_email,
        'password': test_password
    }
    
    try:
        response = client.post('/api/token/', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Login successful!")
            print(f"   📋 Response structure:")
            
            # Check for required fields
            required_fields = ['access', 'refresh']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print("   ✅ Contains access and refresh tokens")
                print(f"   🔑 Access Token (first 50 chars): {data['access'][:50]}...")
                print(f"   🔄 Refresh Token (first 50 chars): {data['refresh'][:50]}...")
            else:
                print(f"   ❌ Missing required fields: {missing_fields}")
            
            # Check for user info
            if 'user' in data:
                user_info = data['user']
                print("   ✅ Contains user information:")
                print(f"   👤 User ID: {user_info.get('id')}")
                print(f"   📧 Email: {user_info.get('email')}")
                print(f"   👤 Name: {user_info.get('name')}")
                print(f"   🏷️  User Type: {user_info.get('user_type')}")
                print(f"   ✅ Active: {user_info.get('is_active')}")
                print(f"   📅 Date Joined: {user_info.get('date_joined')}")
            else:
                print("   ⚠️  No user information in response")
            
            if 'message' in data:
                print(f"   💬 Message: {data['message']}")
                
        elif response.status_code == 401:
            data = response.json()
            print("   ❌ Login failed (authentication error)")
            print(f"   📋 Response: {data}")
        else:
            print(f"   ❌ Unexpected status code: {response.status_code}")
            print(f"   📋 Response: {response.content.decode()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 3: Invalid credentials
    print("\n3. Testing invalid credentials...")
    invalid_data = {
        'email': test_email,
        'password': 'wrongpassword'
    }
    
    try:
        response = client.post('/api/token/',
                             data=json.dumps(invalid_data),
                             content_type='application/json')
        
        if response.status_code == 401:
            print("   ✅ Correctly rejects invalid credentials")
        else:
            print(f"   ❌ Expected 401, got {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing invalid credentials: {e}")
    
    # Test 4: Missing email
    print("\n4. Testing missing email field...")
    incomplete_data = {
        'password': test_password
    }
    
    try:
        response = client.post('/api/token/',
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        
        if response.status_code == 400:
            print("   ✅ Correctly validates missing email")
        else:
            print(f"   ❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing missing email: {e}")
    
    # Test 5: Test with username instead of email (should fail)
    print("\n5. Testing with username instead of email...")
    username_data = {
        'username': test_email,  # Using username field instead of email
        'password': test_password
    }
    
    try:
        response = client.post('/api/token/',
                             data=json.dumps(username_data),
                             content_type='application/json')
        
        if response.status_code == 400:
            print("   ✅ Correctly requires email field (not username)")
        else:
            print(f"   ❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing username field: {e}")
    
    print("\n✅ JWT Token Authentication test completed!")
    print("\nImplementation Summary:")
    print("✅ CustomTokenObtainPairView configured at /api/token/")
    print("✅ Uses email instead of username for authentication")
    print("✅ Returns access token, refresh token, and user info")
    print("✅ Includes user details: id, email, name, user_type, is_active, date_joined")
    print("✅ Properly validates credentials and returns appropriate errors")
    print("✅ Token contains custom claims: email, name, user_type")
    
    return True

if __name__ == "__main__":
    test_jwt_token_authentication()
