# test_registration.py
"""
Script to test the user registration API endpoint with JWT token generation
"""
import json

def print_api_info():
    """Print information about the registration API with JWT tokens"""
    
    print("🚀 User Registration API with JWT Tokens")
    print("=" * 60)
    
    print("\n📍 Available Endpoints:")
    endpoints = [
        "POST /api/register/ - Class-based view",
        "POST /api/signup/ - Function-based view",
        "POST /api/auth/register/ - Alternative endpoint",
        "POST /api/auth/signup/ - Alternative endpoint"
    ]
    for endpoint in endpoints:
        print(f"  • {endpoint}")
    
    print("\n📋 Required Fields:")
    fields = [
        "name - Full name of the user",
        "email - Valid email address (must be unique)",
        "password - Password (min 8 characters, must contain letter and number)",
        "password_confirm - Password confirmation (must match password)",
        "user_type - User type: 'CUSTOMER', 'SELLER', or 'ADMIN' (default: CUSTOMER)"
    ]
    for field in fields:
        print(f"  • {field}")
    
    print("\n📝 Example Request:")
    example_request = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "password123",
        "password_confirm": "password123",
        "user_type": "CUSTOMER"
    }
    print(f"  {json.dumps(example_request, indent=2)}")
    
    print("\n✅ Success Response (201 Created) - WITH JWT TOKENS:")
    success_response = {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "user_type": "CUSTOMER",
            "is_active": True,
            "date_joined": "2025-08-02T10:30:00.123456Z"
        },
        "tokens": {
            "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
        }
    }
    print(f"  {json.dumps(success_response, indent=2)}")
    
    print("\n🔐 JWT Token Details:")
    token_details = [
        "Access Token: Valid for 60 minutes, use for API authentication",
        "Refresh Token: Valid for 7 days, use to get new access tokens",
        "Custom Claims: Includes email, name, and user_type",
        "Auto-generated: Tokens created immediately after registration"
    ]
    for detail in token_details:
        print(f"  • {detail}")
    
    print("\n❌ Error Response (400 Bad Request):")
    error_response = {
        "success": False,
        "message": "Validation failed",
        "errors": {
            "email": ["A user with this email already exists."],
            "password": ["Password must contain at least one number."],
            "password_confirm": ["The two password fields didn't match."]
        }
    }
    print(f"  {json.dumps(error_response, indent=2)}")
    
    print("\n🔧 Password Requirements:")
    requirements = [
        "Minimum 8 characters",
        "Must contain at least one letter",
        "Must contain at least one number",
        "Password confirmation must match"
    ]
    for req in requirements:
        print(f"  • {req}")
    
    print("\n📱 Frontend Usage Example (JavaScript):")
    js_example = '''
    const registerUser = async (userData) => {
      try {
        const response = await fetch('/api/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('Registration successful:', data);
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', data.tokens.access);
          localStorage.setItem('refreshToken', data.tokens.refresh);
          
          // Store user info
          localStorage.setItem('user', JSON.stringify(data.user));
          
          return data;
        } else {
          console.error('Registration failed:', data.errors);
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    };
    
    // Usage - Register and automatically login
    registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      password_confirm: "password123",
      user_type: "CUSTOMER"
    }).then(data => {
      console.log('User is now registered and logged in!');
      console.log('Access token:', data.tokens.access);
      console.log('User info:', data.user);
    });
    '''
    print(js_example)
    
    print("\n🔄 Using the Tokens:")
    token_usage = '''
    // Using access token for authenticated requests
    const makeAuthenticatedRequest = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/orders/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        // Token expired, refresh it
        await refreshAccessToken();
        // Retry the request with new token
      }
      
      return response.json();
    };
    
    const refreshAccessToken = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      
      const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
    };
    '''
    print(token_usage)

if __name__ == "__main__":
    print_api_info()
