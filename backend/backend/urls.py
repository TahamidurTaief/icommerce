# backend/urls.py (located in your project's root config folder)

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Import the new ColorListView
from products.views import ProductViewSet, CategoryViewSet, SubCategoryViewSet, ColorListView
from shops.views import ShopViewSet

# Create a single router to manage all viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'subcategories', SubCategoryViewSet, basename='subcategory')
router.register(r'shops', ShopViewSet, basename='shop')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Add the new URL for the color list
    path('api/colors/', ColorListView.as_view(), name='color-list'),
    # All other API endpoints are managed by the router
    path('api/', include(router.urls)),
]
