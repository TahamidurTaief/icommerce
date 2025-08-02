# test_permissions.py
"""
Test and documentation for custom permission classes
"""
import json

def print_permission_info():
    """Print comprehensive information about the custom permission classes"""
    
    print("🔐 Custom DRF Permission Classes")
    print("=" * 60)
    
    print("\n📋 Available Permission Classes:")
    permissions = [
        {
            "name": "IsCustomer",
            "description": "Only allows customers to access the view",
            "usage": "permission_classes = [IsCustomer]"
        },
        {
            "name": "IsSeller", 
            "description": "Only allows sellers to access the view",
            "usage": "permission_classes = [IsSeller]"
        },
        {
            "name": "IsAdmin",
            "description": "Only allows admins to access the view", 
            "usage": "permission_classes = [IsAdmin]"
        },
        {
            "name": "IsCustomerOrSeller",
            "description": "Allows both customers and sellers",
            "usage": "permission_classes = [IsCustomerOrSeller]"
        },
        {
            "name": "IsSellerOrAdmin", 
            "description": "Allows both sellers and admins",
            "usage": "permission_classes = [IsSellerOrAdmin]"
        },
        {
            "name": "IsOwnerOrAdmin",
            "description": "Users can access their own resources, admins can access any",
            "usage": "permission_classes = [IsOwnerOrAdmin]"
        },
        {
            "name": "IsSellerOwnerOrAdmin",
            "description": "Sellers can access their own resources, admins can access any",
            "usage": "permission_classes = [IsSellerOwnerOrAdmin]"
        },
        {
            "name": "ReadOnlyOrIsAdmin",
            "description": "Read access for all, write access only for admins",
            "usage": "permission_classes = [ReadOnlyOrIsAdmin]"
        },
        {
            "name": "IsCustomerForOrder",
            "description": "Specialized permission for order operations",
            "usage": "permission_classes = [IsCustomerForOrder]"
        }
    ]
    
    for i, perm in enumerate(permissions, 1):
        print(f"\n{i}. **{perm['name']}**")
        print(f"   Description: {perm['description']}")
        print(f"   Usage: {perm['usage']}")
    
    print("\n🚀 Implementation Examples:")
    
    # Example 1: Basic usage
    print("\n1. **Basic Class-Based View:**")
    example1 = '''
from rest_framework import generics
from users.permissions import IsCustomer
from users.serializers import UserSerializer

class CustomerOnlyView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsCustomer]  # Only customers can access
    
    def get_queryset(self):
        return User.objects.filter(user_type='CUSTOMER')
'''
    print(example1)
    
    # Example 2: Function-based view
    print("\n2. **Function-Based View:**")
    example2 = '''
from rest_framework.decorators import api_view, permission_classes
from users.permissions import IsSellerOrAdmin

@api_view(['GET', 'POST'])
@permission_classes([IsSellerOrAdmin])
def seller_dashboard(request):
    if request.user.user_type == 'SELLER':
        return Response({'message': 'Seller dashboard'})
    else:  # Admin
        return Response({'message': 'Admin dashboard'})
'''
    print(example2)
    
    # Example 3: ViewSet with dynamic permissions
    print("\n3. **ViewSet with Dynamic Permissions:**")
    example3 = '''
from rest_framework import viewsets
from users.permissions import IsAdmin, IsOwnerOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAdmin]  # Only admins list all
        elif self.action in ['retrieve', 'update']:
            permission_classes = [IsOwnerOrAdmin]  # Own resource or admin
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
'''
    print(example3)
    
    # Example 4: Combining permissions
    print("\n4. **Combining Multiple Permissions:**")
    example4 = '''
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsCustomerOrSeller

class OrderView(generics.ListCreateAPIView):
    # Both IsAuthenticated AND IsCustomerOrSeller must pass
    permission_classes = [IsAuthenticated, IsCustomerOrSeller]
    
    def get_queryset(self):
        if self.request.user.user_type == 'CUSTOMER':
            return Order.objects.filter(user=self.request.user)
        return Order.objects.none()
'''
    print(example4)
    
    print("\n🔍 Permission Logic Breakdown:")
    
    logic_examples = [
        {
            "permission": "IsCustomer",
            "logic": "request.user.is_authenticated AND request.user.user_type == 'CUSTOMER'"
        },
        {
            "permission": "IsSeller", 
            "logic": "request.user.is_authenticated AND request.user.user_type == 'SELLER'"
        },
        {
            "permission": "IsAdmin",
            "logic": "request.user.is_authenticated AND request.user.user_type == 'ADMIN'"
        },
        {
            "permission": "IsOwnerOrAdmin",
            "logic": "request.user.is_authenticated AND (obj.user == request.user OR request.user.user_type == 'ADMIN')"
        },
        {
            "permission": "ReadOnlyOrIsAdmin",
            "logic": "request.user.is_authenticated AND (request.method in SAFE_METHODS OR request.user.user_type == 'ADMIN')"
        }
    ]
    
    for logic in logic_examples:
        print(f"\n• **{logic['permission']}:**")
        print(f"  Logic: {logic['logic']}")
    
    print("\n📱 Frontend Error Handling:")
    
    error_handling = '''
// Handle permission errors in frontend
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (response.status === 403) {
      const error = await response.json();
      // Show user-friendly permission error
      showError(error.detail || 'Access denied');
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};
'''
    print(error_handling)
    
    print("\n🎯 Common Use Cases:")
    
    use_cases = [
        {
            "scenario": "Product Management",
            "permission": "IsSellerOrAdmin",
            "description": "Sellers can manage their products, admins can manage any"
        },
        {
            "scenario": "Order Creation", 
            "permission": "IsCustomer",
            "description": "Only customers can place orders"
        },
        {
            "scenario": "User Profile",
            "permission": "IsOwnerOrAdmin", 
            "description": "Users edit own profile, admins edit any"
        },
        {
            "scenario": "Analytics Dashboard",
            "permission": "IsAdmin",
            "description": "Only admins can view system analytics"
        },
        {
            "scenario": "Product Browsing",
            "permission": "IsCustomerOrSeller",
            "description": "Customers browse to buy, sellers browse to compare"
        },
        {
            "scenario": "System Settings",
            "permission": "ReadOnlyOrIsAdmin",
            "description": "All can view settings, only admins can modify"
        }
    ]
    
    for i, case in enumerate(use_cases, 1):
        print(f"\n{i}. **{case['scenario']}**")
        print(f"   Permission: {case['permission']}")
        print(f"   Description: {case['description']}")
    
    print("\n🛡️ Security Best Practices:")
    
    best_practices = [
        "Always check user.is_authenticated first",
        "Use hasattr() to safely check for user_type attribute", 
        "Combine with object-level permissions when needed",
        "Provide clear error messages for better UX",
        "Test all permission scenarios thoroughly",
        "Use multiple permissions for complex access control",
        "Consider caching user permissions for performance"
    ]
    
    for i, practice in enumerate(best_practices, 1):
        print(f"{i}. {practice}")
    
    print("\n⚡ Performance Tips:")
    
    performance_tips = [
        "Cache user type in request for multiple checks",
        "Use select_related() for user queries to avoid N+1 problems", 
        "Consider using permission groups for complex scenarios",
        "Implement custom permission caching if needed",
        "Use database indexes on user_type field for better performance"
    ]
    
    for i, tip in enumerate(performance_tips, 1):
        print(f"{i}. {tip}")

if __name__ == "__main__":
    print_permission_info()
