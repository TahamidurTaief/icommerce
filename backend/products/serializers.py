# products/serializers.py
from rest_framework import serializers
from .models import (
    Product, Category, SubCategory, ProductSpecification,
    ProductAdditionalImage, ProductAdditionalDescription, Review
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
        fields = ['id', 'name', 'slug', 'image', 'subcategories']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['name', 'value']

class ProductAdditionalImageSerializer(serializers.ModelSerializer):
    # Return the full URL for the additional images
    image = serializers.SerializerMethodField()
    class Meta:
        model = ProductAdditionalImage
        fields = ['id', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

class ProductAdditionalDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAdditionalDescription
        fields = ['id', 'description']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    sub_category = SubCategorySerializer(read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    additional_images = ProductAdditionalImageSerializer(many=True, read_only=True, context={'request': None})
    additional_descriptions = ProductAdditionalDescriptionSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    
    # Fields to make frontend logic simpler
    thumbnail_url = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    sizes = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'shop', 'name', 'slug', 'description', 'sub_category', 
            'price', 'discount_price', 'stock', 'is_active',
            'thumbnail', 'thumbnail_url',
            'specifications', 'additional_images', 'additional_descriptions',
            'colors', 'sizes', 'reviews', 'rating', 'review_count'
        ]
        
    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and hasattr(obj.thumbnail, 'url'):
            return request.build_absolute_uri(obj.thumbnail.url)
        return None
        
    def get_colors(self, obj):
        color_specs = obj.specifications.filter(name__iexact='Color')
        def name_to_hex(color_name):
            mapping = {
                'black': '#000000', 'white': '#ffffff', 'red': '#ff0000',
                'green': '#008000', 'blue': '#0000ff', 'yellow': '#ffff00',
                'cyan': '#00ffff', 'magenta': '#ff00ff', 'silver': '#c0c0c0',
                'gray': '#808080', 'maroon': '#800000', 'olive': '#808000',
                'purple': '#800080', 'teal': '#008080', 'navy': '#000080'
            }
            return mapping.get(color_name.lower(), '#cccccc')
        return [{'name': spec.value, 'hex': name_to_hex(spec.value)} for spec in color_specs]

    def get_sizes(self, obj):
        size_specs = obj.specifications.filter(name__iexact='Size')
        return [spec.value for spec in size_specs]

    def get_rating(self, obj):
        from django.db.models import Avg
        return obj.reviews.aggregate(Avg('rating'))['rating__avg'] or 0

    def get_review_count(self, obj):
        return obj.reviews.count()