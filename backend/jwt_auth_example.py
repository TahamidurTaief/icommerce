#!/usr/bin/env python3
"""
Example usage of JWT Token Authentication API
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def demonstrate_jwt_auth():
    """Demonstrate JWT authentication usage"""
    print("🚀 JWT Authentication API Usage Example")
    print("=" * 50)
    
    # Step 1: Register a new user (optional)
    print("\n1. Register a new user (optional)...")
    register_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "securepass123",
        "confirm_password": "securepass123"
    }
    
    print("POST /api/register/")
    print(f"Data: {json.dumps(register_data, indent=2)}")
    
    # Step 2: Login with email and password
    print("\n2. Login with email and password...")
    login_data = {
        "email": "john.doe@example.com",
        "password": "securepass123"
    }
    
    print("POST /api/token/")
    print(f"Data: {json.dumps(login_data, indent=2)}")
    
    try:
        response = requests.post(f"{BASE_URL}/api/token/", 
                               json=login_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            tokens = response.json()
            print("\n✅ Login successful!")
            print("Response:")
            print(json.dumps(tokens, indent=2))
            
            access_token = tokens['access']
            refresh_token = tokens['refresh']
            user_info = tokens['user']
            
            print(f"\n🔑 Access Token: {access_token[:50]}...")
            print(f"🔄 Refresh Token: {refresh_token[:50]}...")
            print(f"👤 User Info: {user_info['name']} ({user_info['email']})")
            
            # Step 3: Use access token to access protected endpoints
            print("\n3. Using access token to access protected endpoints...")
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            print("GET /api/products/ (with Authorization header)")
            print(f"Headers: {json.dumps(headers, indent=2)}")
            
            # Step 4: Refresh token when access token expires
            print("\n4. Refresh token when access token expires...")
            refresh_data = {
                "refresh": refresh_token
            }
            
            print("POST /api/token/refresh/")
            print(f"Data: {json.dumps(refresh_data, indent=2)}")
            
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Server not running. Start with: python manage.py runserver")
    
    print("\n📋 API Endpoints Summary:")
    print("POST /api/register/     - Register new user")
    print("POST /api/token/        - Login (get tokens)")
    print("POST /api/token/refresh/ - Refresh access token")
    print("Protected endpoints     - Use Authorization: Bearer <access_token>")
    
    print("\n🔐 JWT Token Features:")
    print("✅ Email-based authentication (not username)")
    print("✅ Returns access token (15 minutes lifetime)")
    print("✅ Returns refresh token (7 days lifetime)")
    print("✅ Includes user info in login response")
    print("✅ Custom claims in JWT token")
    print("✅ Token rotation and blacklisting")

if __name__ == "__main__":
    demonstrate_jwt_auth()
