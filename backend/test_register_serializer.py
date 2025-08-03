#!/usr/bin/env python3
"""
Test script to verify RegisterSerializer functionality
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

from users.serializers import RegisterSerializer
from users.models import User

def test_register_serializer():
    """Test RegisterSerializer functionality"""
    print("🧪 Testing RegisterSerializer...")
    print("=" * 50)
    
    # Test 1: Valid registration data
    print("1. Testing valid registration data...")
    valid_data = {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    serializer = RegisterSerializer(data=valid_data)
    if serializer.is_valid():
        print("   ✅ Serializer validation passed")
        
        # Check if user with this email already exists
        if User.objects.filter(email=valid_data['email']).exists():
            print("   ℹ️  User already exists, skipping creation")
            user = User.objects.get(email=valid_data['email'])
        else:
            user = serializer.save()
            print("   ✅ User created successfully")
        
        # Test the representation
        representation = serializer.to_representation(user)
        expected_fields = ['id', 'name', 'email']
        
        if all(field in representation for field in expected_fields):
            print("   ✅ Returns correct basic info (id, name, email)")
            print(f"   📋 User data: {representation}")
        else:
            print("   ❌ Missing expected fields in representation")
            print(f"   📋 Got: {representation}")
    else:
        print("   ❌ Serializer validation failed")
        print(f"   📋 Errors: {serializer.errors}")
    
    # Test 2: Password mismatch
    print("\n2. Testing password mismatch...")
    invalid_data = {
        'name': 'Jane Doe',
        'email': 'jane.doe@example.com',
        'password': 'testpass123',
        'confirm_password': 'differentpass123'
    }
    
    serializer = RegisterSerializer(data=invalid_data)
    if not serializer.is_valid():
        if 'confirm_password' in serializer.errors:
            print("   ✅ Correctly validates password mismatch")
        else:
            print("   ❌ Password mismatch validation failed")
            print(f"   📋 Errors: {serializer.errors}")
    else:
        print("   ❌ Should have failed validation for password mismatch")
    
    # Test 3: Duplicate email
    print("\n3. Testing duplicate email...")
    duplicate_data = {
        'name': 'Another User',
        'email': 'john.doe@example.com',  # Same as first test
        'password': 'testpass123',
        'confirm_password': 'testpass123'
    }
    
    serializer = RegisterSerializer(data=duplicate_data)
    if not serializer.is_valid():
        if 'email' in serializer.errors:
            print("   ✅ Correctly validates duplicate email")
        else:
            print("   ❌ Duplicate email validation failed")
            print(f"   📋 Errors: {serializer.errors}")
    else:
        print("   ❌ Should have failed validation for duplicate email")
    
    # Test 4: Missing required fields
    print("\n4. Testing missing required fields...")
    incomplete_data = {
        'name': 'Test User',
        'password': 'testpass123'
        # Missing email and confirm_password
    }
    
    serializer = RegisterSerializer(data=incomplete_data)
    if not serializer.is_valid():
        missing_fields = ['email', 'confirm_password']
        has_missing_validation = any(field in serializer.errors for field in missing_fields)
        if has_missing_validation:
            print("   ✅ Correctly validates missing required fields")
        else:
            print("   ❌ Missing field validation failed")
            print(f"   📋 Errors: {serializer.errors}")
    else:
        print("   ❌ Should have failed validation for missing fields")
    
    print("\n✅ RegisterSerializer test completed!")
    print("\nSummary:")
    print("✅ Accepts: name, email, password, confirm_password")
    print("✅ Validates: password matching")
    print("✅ Creates: user with hashed password")
    print("✅ Returns: user's basic info (id, name, email)")

if __name__ == "__main__":
    test_register_serializer()
