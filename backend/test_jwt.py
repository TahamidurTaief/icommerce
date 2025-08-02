# test_jwt.py
import os
import sys
import django

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Setup Django
django.setup()

from users.models import User
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

def test_jwt_setup():
    print("Testing JWT Setup...")
    
    # Test 1: Check if we can import JWT classes
    try:
        from rest_framework_simplejwt.views import TokenObtainPairView
        print("✅ JWT imports working")
    except ImportError as e:
        print(f"❌ JWT import failed: {e}")
        return
    
    # Test 2: Check custom serializer
    try:
        serializer = CustomTokenObtainPairSerializer()
        print("✅ Custom JWT serializer working")
    except Exception as e:
        print(f"❌ Custom serializer failed: {e}")
        return
    
    # Test 3: Check if we can create a token for a user (if any users exist)
    try:
        if User.objects.exists():
            user = User.objects.first()
            token = RefreshToken.for_user(user)
            print(f"✅ Token generation working: {str(token.access_token)[:50]}...")
        else:
            print("ℹ️  No users exist to test token generation")
    except Exception as e:
        print(f"❌ Token generation failed: {e}")
    
    print("JWT setup test completed!")

if __name__ == "__main__":
    test_jwt_setup()
