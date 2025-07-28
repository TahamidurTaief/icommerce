import random
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker

from users.models import User
from shops.models import Shop
from products.models import Category, SubCategory, Product, ProductSpecification

# এই কমান্ডটি ডাটাবেস পরিষ্কার করে নতুন করে ফেক ডেটা তৈরি করবে
# ব্যবহারের আগে অবশ্যই ডাটাবেসের ব্যাকআপ নিয়ে রাখবেন

class Command(BaseCommand):
    help = 'Seeds the database with fake data'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting old data...")
        # মডেলগুলোকে নিচ থেকে উপরের দিকে ডিলিট করুন
        ProductSpecification.objects.all().delete()
        Product.objects.all().delete()
        SubCategory.objects.all().delete()
        Category.objects.all().delete()
        Shop.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write("Creating new data...")
        fake = Faker()

        # --- Users and Shops ---
        sellers = []
        for _ in range(10):  # ১০ জন সেলার তৈরি হবে
            user = User.objects.create_user(
                email=fake.email(),
                password='password123',
                full_name=fake.name()
            )
            shop = Shop.objects.create(
                owner=user,
                name=fake.company(),
                slug=fake.slug(),
                description=fake.text()
            )
            sellers.append(shop)
        
        for _ in range(30): # ৩০ জন সাধারণ ইউজার
             User.objects.create_user(
                email=fake.email(),
                password='password123',
                full_name=fake.name()
            )

        # --- Categories and Subcategories ---
        categories_data = {
            "Electronics": ["Smartphones", "Laptops", "Headphones"],
            "Fashion": ["Men's Clothing", "Women's Clothing", "Shoes"],
            "Home & Garden": ["Furniture", "Kitchen Appliances", "Gardening Tools"],
            "Health & Beauty": ["Skincare", "Makeup", "Haircare"]
        }
        
        subcategories_list = []
        for cat_name, sub_cat_names in categories_data.items():
            category = Category.objects.create(name=cat_name, slug=fake.slug())
            for sub_cat_name in sub_cat_names:
                subcategory = SubCategory.objects.create(
                    name=sub_cat_name, 
                    slug=f"{fake.slug()}-{random.randint(100, 999)}", 
                    category=category
                )
                subcategories_list.append(subcategory)

        # --- Products ---
        for i in range(150): # ১৫০টি প্রোডাক্ট তৈরি হবে
            shop = random.choice(sellers)
            sub_category = random.choice(subcategories_list)
            
            product_name = fake.bs().title()
            product = Product.objects.create(
                shop=shop,
                name=product_name,
                slug=f"{fake.slug()}-{i}",
                description=fake.paragraph(nb_sentences=10),
                sub_category=sub_category,
                price=random.uniform(10.0, 1000.0),
                discount_price=random.uniform(5.0, 900.0),
                stock=random.randint(0, 100),
                is_active=True
            )
            
            # Add Specifications (e.g., Color, Size)
            ProductSpecification.objects.create(product=product, name="Color", value=fake.color_name())
            ProductSpecification.objects.create(product=product, name="Size", value=random.choice(["S", "M", "L", "XL"]))
            ProductSpecification.objects.create(product=product, name="Material", value=random.choice(["Cotton", "Polyester", "Leather"]))


        self.stdout.write(self.style.SUCCESS('Successfully seeded database.'))

