# products/serializers.py
from rest_framework import serializers
from .models import (
    Product, Category, SubCategory, ProductSpecification,
    ProductAdditionalImage, ProductAdditionalDescription
)
from shops.serializers import ShopSerializer



class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'subcategories']

class SubCategorySerializer(serializers.ModelSerializer):
    # Nest the parent category for more context
    category = CategorySerializer(read_only=True)
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'category']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['name', 'value']

# New Serializer for Additional Images
class ProductAdditionalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAdditionalImage
        fields = ['id', 'image']

# New Serializer for Additional Descriptions
class ProductAdditionalDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAdditionalDescription
        fields = ['id', 'description']

# Updated ProductSerializer
class ProductSerializer(serializers.ModelSerializer):
    # Nested serializers for rich, read-only data
    shop = ShopSerializer(read_only=True)
    sub_category = SubCategorySerializer(read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    
    # --- ADDED THESE LINES ---
    additional_images = ProductAdditionalImageSerializer(many=True, read_only=True)
    additional_descriptions = ProductAdditionalDescriptionSerializer(many=True, read_only=True)
    # -------------------------

    class Meta:
        model = Product
        fields = [
            'id', 'shop', 'name', 'slug', 'description', 'sub_category', 
            'price', 'discount_price', 'stock', 'thumbnail',
            # --- ADDED TO FIELDS LIST ---
            'specifications', 'additional_images', 'additional_descriptions'
        ]