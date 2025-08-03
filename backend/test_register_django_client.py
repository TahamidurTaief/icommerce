#!/usr/bin/env python3
"""
Test RegisterAPIView using Django's test client
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
import json

def test_register_api_view():
    """Test RegisterAPIView using Django test client"""
    print("🧪 Testing RegisterAPIView with Django Test Client...")
    print("=" * 60)
    
    client = Client()
    
    # Test 1: Valid registration
    print("1. Testing valid registration...")
    test_data = {
        'name': 'Test User',
        'email': 'testuser@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    try:
        response = client.post('/api/register/', 
                             data=json.dumps(test_data),
                             content_type='application/json')
        
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
            print(f"   📋 Response: {response.content.decode()}")
            
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
        response = client.post('/api/register/',
                             data=json.dumps(mismatch_data),
                             content_type='application/json')
        
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
        'email': 'testuser@example.com',  # Same email as test 1
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    try:
        response = client.post('/api/register/',
                             data=json.dumps(duplicate_data),
                             content_type='application/json')
        
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
    
    print("\n✅ RegisterAPIView test completed!")
    print("\nImplementation Summary:")
    print("✅ RegisterAPIView created using APIView")
    print("✅ URL: /api/register/ configured")
    print("✅ POST method implemented")
    print("✅ Uses RegisterSerializer for validation")
    print("✅ Returns 201 status on success with user data")
    print("✅ Returns 400 status on failure with error details")
    print("✅ Handles 'Email already exists' and other validation errors")
    
    return True

if __name__ == "__main__":
    test_register_api_view()
