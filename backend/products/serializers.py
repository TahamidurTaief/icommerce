# products/serializers.py
from rest_framework import serializers
from .models import Product, Category, ProductSpecification
from shops.serializers import ShopSerializer
from shops.models import Shop # Import Shop model

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['name', 'value']

class ProductSerializer(serializers.ModelSerializer):
    # For READ operations, show the full nested Shop and Category details
    shop = ShopSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)

    # For WRITE operations, we only need the ID of the shop and category
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), source='shop', write_only=True
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'shop', 'shop_id', 'name', 'slug', 'description', 
            'category', 'category_id', 'price', 'discount_price', 'stock', 
            'thumbnail', 'specifications'
        ]