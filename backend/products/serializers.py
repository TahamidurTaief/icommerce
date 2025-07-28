# backend/products/serializers.py

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
        fields = ['id', 'name', 'slug', 'image', 'subcategories'] # <-- 'image' যোগ করা হয়েছে

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['name', 'value']

class ProductAdditionalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAdditionalImage
        fields = ['id', 'image']

class ProductAdditionalDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAdditionalDescription
        fields = ['id', 'description']

class ProductSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    sub_category = SubCategorySerializer(read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    additional_images = ProductAdditionalImageSerializer(many=True, read_only=True)
    additional_descriptions = ProductAdditionalDescriptionSerializer(many=True, read_only=True)
    
    # --- thumbnail এর সম্পূর্ণ URL পাওয়ার জন্য এটি যোগ করুন ---
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'shop', 'name', 'slug', 'description', 'sub_category', 
            'price', 'discount_price', 'stock', 'thumbnail',
            'thumbnail_url',  # <-- এখানে যোগ করুন
            'specifications', 'additional_images', 'additional_descriptions'
        ]
        
    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

