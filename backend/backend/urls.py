# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from products.views import ProductViewSet, CategoryViewSet, SubCategoryViewSet, ColorViewSet, SizeViewSet
from shops.views import ShopViewSet
from orders.views import OrderViewSet, ShippingMethodViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'subcategories', SubCategoryViewSet, basename='subcategory')
router.register(r'colors', ColorViewSet, basename='color')
router.register(r'sizes', SizeViewSet, basename='size')
router.register(r'shops', ShopViewSet, basename='shop')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'shipping-methods', ShippingMethodViewSet, basename='shipping-method')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
