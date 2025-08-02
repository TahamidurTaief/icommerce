# users/permission_examples.py
"""
Example views demonstrating how to use custom permission classes
"""
from rest_framework import generics, viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import User, Address
from .serializers import UserSerializer
from .permissions import (
    IsCustomer, IsSeller, IsAdmin, IsCustomerOrSeller, 
    IsSellerOrAdmin, IsOwnerOrAdmin, IsSellerOwnerOrAdmin,
    ReadOnlyOrIsAdmin, IsCustomerForOrder
)


# Example 1: Customer-only endpoint
class CustomerOnlyView(generics.ListAPIView):
    """
    A view that only customers can access
    """
    serializer_class = UserSerializer
    permission_classes = [IsCustomer]
    
    def get_queryset(self):
        # Return only customers
        return User.objects.filter(user_type='CUSTOMER')


# Example 2: Seller-only endpoint
class SellerOnlyView(generics.ListAPIView):
    """
    A view that only sellers can access
    """
    serializer_class = UserSerializer
    permission_classes = [IsSeller]
    
    def get_queryset(self):
        # Return only sellers
        return User.objects.filter(user_type='SELLER')


# Example 3: Admin-only endpoint
class AdminOnlyView(generics.ListAPIView):
    """
    A view that only admins can access
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        # Admins can see all users
        return User.objects.all()


# Example 4: Customer or Seller endpoint
class CustomerOrSellerView(generics.ListAPIView):
    """
    A view that both customers and sellers can access
    """
    serializer_class = UserSerializer
    permission_classes = [IsCustomerOrSeller]
    
    def get_queryset(self):
        # Return customers and sellers only
        return User.objects.filter(user_type__in=['CUSTOMER', 'SELLER'])


# Example 5: Seller or Admin endpoint
class SellerOrAdminView(generics.ListAPIView):
    """
    A view that sellers and admins can access
    """
    serializer_class = UserSerializer
    permission_classes = [IsSellerOrAdmin]
    
    def get_queryset(self):
        # Return sellers and admins
        return User.objects.filter(user_type__in=['SELLER', 'ADMIN'])


# Example 6: Owner or Admin endpoint
class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    """
    A view where users can only access their own profile, or admins can access any
    """
    serializer_class = UserSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_queryset(self):
        # Admins can access any user profile
        if (hasattr(self.request.user, 'user_type') and 
            self.request.user.user_type == 'ADMIN'):
            return User.objects.all()
        # Regular users can only access their own profile
        return User.objects.filter(id=self.request.user.id)


# Example 7: Read-only or Admin
class UserManagementView(generics.ListCreateAPIView):
    """
    A view where everyone can read, but only admins can create/modify
    """
    serializer_class = UserSerializer
    permission_classes = [ReadOnlyOrIsAdmin]
    
    def get_queryset(self):
        return User.objects.all()


# Example 8: Function-based view with permissions
@api_view(['GET', 'POST'])
@permission_classes([IsSellerOrAdmin])
def seller_dashboard(request):
    """
    A dashboard endpoint for sellers and admins
    """
    if request.method == 'GET':
        # Get seller-specific data
        if request.user.user_type == 'SELLER':
            data = {
                'message': f'Welcome seller {request.user.name}',
                'user_type': request.user.user_type,
                'can_manage_products': True,
                'can_view_orders': True,
            }
        else:  # Admin
            data = {
                'message': f'Welcome admin {request.user.name}',
                'user_type': request.user.user_type,
                'can_manage_all_products': True,
                'can_view_all_orders': True,
                'can_manage_users': True,
            }
        
        return Response(data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Handle seller/admin specific actions
        action = request.data.get('action')
        
        if action == 'get_stats':
            if request.user.user_type == 'SELLER':
                # Return seller-specific stats
                stats = {
                    'total_products': 0,  # Would query actual data
                    'total_orders': 0,
                    'revenue': 0,
                }
            else:  # Admin
                # Return platform-wide stats
                stats = {
                    'total_users': User.objects.count(),
                    'total_sellers': User.objects.filter(user_type='SELLER').count(),
                    'total_customers': User.objects.filter(user_type='CUSTOMER').count(),
                }
            
            return Response({'stats': stats}, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Invalid action'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


# Example 9: ViewSet with different permissions for different actions
class UserViewSet(viewsets.ModelViewSet):
    """
    A ViewSet with different permissions for different actions
    """
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions required for this view.
        """
        if self.action == 'list':
            # Only admins can list all users
            permission_classes = [IsAdmin]
        elif self.action == 'create':
            # Only admins can create users via this endpoint
            permission_classes = [IsAdmin]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            # Users can view/update their own profile, admins can access any
            permission_classes = [IsOwnerOrAdmin]
        elif self.action == 'destroy':
            # Only admins can delete users
            permission_classes = [IsAdmin]
        else:
            # Default permission for any other action
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Return queryset based on user permissions
        """
        if (hasattr(self.request.user, 'user_type') and 
            self.request.user.user_type == 'ADMIN'):
            return User.objects.all()
        
        # Regular users can only see their own profile
        return User.objects.filter(id=self.request.user.id)


# Example 10: Custom permission with complex logic
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_type_specific_data(request):
    """
    Return different data based on user type with manual permission checking
    """
    user = request.user
    
    if not hasattr(user, 'user_type'):
        return Response(
            {'error': 'User type not defined'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if user.user_type == 'CUSTOMER':
        data = {
            'message': 'Customer dashboard',
            'available_actions': ['browse_products', 'place_orders', 'view_order_history'],
            'user_info': {
                'name': user.name,
                'email': user.email,
                'type': user.user_type
            }
        }
    elif user.user_type == 'SELLER':
        data = {
            'message': 'Seller dashboard',
            'available_actions': ['manage_products', 'view_sales', 'update_inventory'],
            'user_info': {
                'name': user.name,
                'email': user.email,
                'type': user.user_type
            }
        }
    elif user.user_type == 'ADMIN':
        data = {
            'message': 'Admin dashboard',
            'available_actions': ['manage_users', 'view_analytics', 'system_settings'],
            'user_info': {
                'name': user.name,
                'email': user.email,
                'type': user.user_type
            },
            'admin_stats': {
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(is_active=True).count(),
            }
        }
    else:
        return Response(
            {'error': 'Invalid user type'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response(data, status=status.HTTP_200_OK)
