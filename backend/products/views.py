# products/views.py
import logging
from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Category, SubCategory, Color, Size
from .serializers import ProductSerializer, CategorySerializer, SubCategorySerializer, ColorSerializer, SizeSerializer
from .permissions import IsShopOwnerOrReadOnly
from .filters import ProductFilter

# Set up logging
logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('shop', 'sub_category__category').prefetch_related('colors', 'sizes', 'reviews')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  # Changed to AllowAny for public read access
    filterset_class = ProductFilter
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        """
        Override to apply different permissions based on the action.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Write operations require custom permission
            self.permission_classes = [IsShopOwnerOrReadOnly]
        else:
            # Read operations are public
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        """
        Override list method to add proper error handling and logging.
        """
        try:
            logger.info(f"ProductViewSet.list called with params: {request.query_params}")
            
            # Get the queryset
            queryset = self.filter_queryset(self.get_queryset())
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                logger.info(f"Successfully paginated {len(page)} products")
                return self.get_paginated_response(serializer.data)
            
            # If no pagination
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Successfully returned {len(queryset)} products")
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in ProductViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve method to add proper error handling and logging.
        """
        try:
            logger.info(f"ProductViewSet.retrieve called with slug: {kwargs.get('slug')}")
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            logger.info(f"Successfully retrieved product: {instance.name}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in ProductViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        # Assumes a user has a one-to-one relationship with a shop
        if hasattr(self.request.user, 'shop'):
            serializer.save(shop=self.request.user.shop)
        else:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You do not have a shop to add products to.")

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"CategoryViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} categories")
            return response
        except Exception as e:
            logger.error(f"Error in CategoryViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"CategoryViewSet.retrieve called with slug: {kwargs.get('slug')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved category")
            return response
        except Exception as e:
            logger.error(f"Error in CategoryViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"SubCategoryViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} subcategories")
            return response
        except Exception as e:
            logger.error(f"Error in SubCategoryViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"SubCategoryViewSet.retrieve called with slug: {kwargs.get('slug')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved subcategory")
            return response
        except Exception as e:
            logger.error(f"Error in SubCategoryViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ColorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"ColorViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} colors")
            return response
        except Exception as e:
            logger.error(f"Error in ColorViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"ColorViewSet.retrieve called with id: {kwargs.get('pk')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved color")
            return response
        except Exception as e:
            logger.error(f"Error in ColorViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SizeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"SizeViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} sizes")
            return response
        except Exception as e:
            logger.error(f"Error in SizeViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"SizeViewSet.retrieve called with id: {kwargs.get('pk')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved size")
            return response
        except Exception as e:
            logger.error(f"Error in SizeViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
