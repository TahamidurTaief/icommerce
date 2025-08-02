# users/permissions.py
from rest_framework import permissions


class IsCustomer(permissions.BasePermission):
    """
    Custom permission to only allow customers to access a view.
    """
    message = "Access denied. This action is only available to customers."

    def has_permission(self, request, view):
        """
        Check if the user is authenticated and has customer user type
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'user_type') and
            request.user.user_type == 'CUSTOMER'
        )


class IsSeller(permissions.BasePermission):
    """
    Custom permission to only allow sellers to access a view.
    """
    message = "Access denied. This action is only available to sellers."

    def has_permission(self, request, view):
        """
        Check if the user is authenticated and has seller user type
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'user_type') and
            request.user.user_type == 'SELLER'
        )


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins to access a view.
    """
    message = "Access denied. This action is only available to administrators."

    def has_permission(self, request, view):
        """
        Check if the user is authenticated and has admin user type
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'user_type') and
            request.user.user_type == 'ADMIN'
        )


class IsCustomerOrSeller(permissions.BasePermission):
    """
    Custom permission to allow both customers and sellers to access a view.
    """
    message = "Access denied. This action is only available to customers and sellers."

    def has_permission(self, request, view):
        """
        Check if the user is authenticated and has customer or seller user type
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'user_type') and
            request.user.user_type in ['CUSTOMER', 'SELLER']
        )


class IsSellerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow both sellers and admins to access a view.
    """
    message = "Access denied. This action is only available to sellers and administrators."

    def has_permission(self, request, view):
        """
        Check if the user is authenticated and has seller or admin user type
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'user_type') and
            request.user.user_type in ['SELLER', 'ADMIN']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    """
    message = "Access denied. You can only access your own resources or be an administrator."

    def has_permission(self, request, view):
        """
        Check if the user is authenticated
        """
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Check if the user is the owner of the object or an admin
        """
        # Check if user is admin
        if (hasattr(request.user, 'user_type') and 
            request.user.user_type == 'ADMIN'):
            return True
        
        # Check if user is the owner of the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # If object doesn't have a user field, check if it's the user itself
        return obj == request.user


class IsSellerOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission for seller-specific resources.
    Only allows the seller who owns the resource or admins to access it.
    """
    message = "Access denied. You can only access your own seller resources or be an administrator."

    def has_permission(self, request, view):
        """
        Check if the user is authenticated and is either a seller or admin
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'user_type') and
            request.user.user_type in ['SELLER', 'ADMIN']
        )

    def has_object_permission(self, request, view, obj):
        """
        Check if the user is admin or the seller who owns the object
        """
        # Check if user is admin
        if (hasattr(request.user, 'user_type') and 
            request.user.user_type == 'ADMIN'):
            return True
        
        # Check if user is a seller and owns the object
        if (hasattr(request.user, 'user_type') and 
            request.user.user_type == 'SELLER'):
            if hasattr(obj, 'seller'):
                return obj.seller == request.user
            elif hasattr(obj, 'user'):
                return obj.user == request.user
        
        return False


class ReadOnlyOrIsAdmin(permissions.BasePermission):
    """
    Custom permission to allow read-only access to everyone,
    but write access only to admins.
    """
    message = "Write access denied. Only administrators can modify this resource."

    def has_permission(self, request, view):
        """
        Allow read access to authenticated users,
        write access only to admins
        """
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Allow read access (GET, HEAD, OPTIONS) to all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow write access only to admins
        return (
            hasattr(request.user, 'user_type') and
            request.user.user_type == 'ADMIN'
        )


class IsCustomerForOrder(permissions.BasePermission):
    """
    Custom permission specifically for order-related operations.
    Only customers can create orders, but admins can view all orders.
    """
    message = "Order access denied. Only customers can create orders."

    def has_permission(self, request, view):
        """
        Check permissions based on request method and user type
        """
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admins can do anything
        if (hasattr(request.user, 'user_type') and 
            request.user.user_type == 'ADMIN'):
            return True
        
        # For POST (create), only customers allowed
        if request.method == 'POST':
            return (
                hasattr(request.user, 'user_type') and
                request.user.user_type == 'CUSTOMER'
            )
        
        # For other methods, allow customers (they'll be filtered by ownership)
        return (
            hasattr(request.user, 'user_type') and
            request.user.user_type == 'CUSTOMER'
        )

    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions for orders
        """
        # Admins can access any order
        if (hasattr(request.user, 'user_type') and 
            request.user.user_type == 'ADMIN'):
            return True
        
        # Customers can only access their own orders
        if (hasattr(request.user, 'user_type') and 
            request.user.user_type == 'CUSTOMER'):
            return hasattr(obj, 'user') and obj.user == request.user
        
        return False
