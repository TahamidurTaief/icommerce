# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from products.views import ProductViewSet, CategoryViewSet
from shops.views import ShopViewSet

# Create a single router to manage all viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'shops', ShopViewSet, basename='shop')

urlpatterns = [
    path('admin/', admin.site.urls),
    # All API endpoints are now managed by the router
    path('api/', include(router.urls)),
]