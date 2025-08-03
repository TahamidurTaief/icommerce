#!/usr/bin/env python
"""Test script to check if API endpoints are working"""
import os
import sys
import django

# Add the backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Category, Product, Color, Size
from shops.models import Shop
from django.contrib.auth import get_user_model

User = get_user_model()

def main():
    print("=== Database Status ===")
    print(f"Users: {User.objects.count()}")
    print(f"Shops: {Shop.objects.count()}")
    print(f"Categories: {Category.objects.count()}")
    print(f"Colors: {Color.objects.count()}")
    print(f"Sizes: {Size.objects.count()}")
    print(f"Products: {Product.objects.count()}")
    
    print("\n=== Sample Data ===")
    print("Categories:")
    for cat in Category.objects.all()[:5]:
        print(f"  - {cat.name} (slug: {cat.slug})")
    
    print("\nProducts (first 5):")
    for product in Product.objects.all()[:5]:
        print(f"  - {product.name} - ${product.price} ({product.sub_category.category.name})")
    
    print("\nShops:")
    for shop in Shop.objects.all()[:5]:
        print(f"  - {shop.name} (Owner: {shop.owner.email})")

    print("\n=== Testing Model Ordering ===")
    print("Categories are ordered by:", Category._meta.ordering)
    print("Products are ordered by:", Product._meta.ordering)
    print("Colors are ordered by:", Color._meta.ordering)
    print("Sizes are ordered by:", Size._meta.ordering)

if __name__ == "__main__":
    main()
