import random
from django.core.management.base import BaseCommand
from faker import Faker
from products.models import (
    Color, Size, Category, SubCategory, Product,
    ProductAdditionalImage, ProductAdditionalDescription,
    ProductSpecification, Review
)
from shops.models import Shop
from users.models import User, Address
from orders.models import ShippingMethod, Order, OrderItem, OrderUpdate
from django.contrib.auth.hashers import make_password
from django.utils.text import slugify
from decimal import Decimal
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

fake = Faker()

class Command(BaseCommand):
    help = 'Generates fake data for the e-commerce platform'

    def handle(self, *args, **options):
        self.stdout.write("Generating fake data...")
        
        # Clear existing data (optional - uncomment if needed)
        # self.clear_existing_data()
        
        # Create colors
        colors = self.create_colors()
        
        # Create sizes
        sizes = self.create_sizes()
        
        # Create categories and subcategories
        categories, subcategories = self.create_categories()
        
        # Create shipping methods
        shipping_methods = self.create_shipping_methods()
        
        # Create users
        users = self.create_users()
        
        # Create addresses
        addresses = self.create_addresses(users)
        
        # Create shops
        shops = self.create_shops(users)
        
        if not shops:
            self.stdout.write(self.style.ERROR("No shops created - cannot create products"))
            return
            
        # Create products
        products = self.create_products(shops, subcategories, colors, sizes)
        
        # Create product additional data
        self.create_product_additional_data(products)
        
        # Create reviews
        self.create_reviews(products, users)
        
        # Create orders
        orders = self.create_orders(users, addresses, shipping_methods)
        
        # Create order items
        self.create_order_items(orders, products, colors, sizes)
        
        # Create order updates
        self.create_order_updates(orders)
        
        self.stdout.write(self.style.SUCCESS("Successfully generated fake data!"))

    def clear_existing_data(self):
        """Optional method to clear existing data"""
        models = [
            Color, Size, Category, SubCategory, Product,
            ProductAdditionalImage, ProductAdditionalDescription,
            ProductSpecification, Review, Shop, User, Address,
            ShippingMethod, Order, OrderItem, OrderUpdate
        ]
        
        for model in models:
            model.objects.all().delete()
            self.stdout.write(f"Cleared {model.__name__} data")

    def create_colors(self):
        self.stdout.write("Creating colors...")
        colors = [
            ("Red", "#FF0000"),
            ("Blue", "#0000FF"),
            ("Green", "#00FF00"),
            ("Black", "#000000"),
            ("White", "#FFFFFF"),
            ("Yellow", "#FFFF00"),
            ("Purple", "#800080"),
            ("Pink", "#FFC0CB"),
            ("Orange", "#FFA500"),
            ("Gray", "#808080"),
        ]
        
        created_colors = []
        for name, hex_code in colors:
            color, created = Color.objects.get_or_create(
                name=name,
                hex_code=hex_code
            )
            if created:
                created_colors.append(color)
        
        return created_colors

    def create_sizes(self):
        self.stdout.write("Creating sizes...")
        sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "36", "38", "40", "42", "44"]
        
        created_sizes = []
        for size in sizes:
            size_obj, created = Size.objects.get_or_create(name=size)
            if created:
                created_sizes.append(size_obj)
        
        return created_sizes

    def create_categories(self):
        self.stdout.write("Creating categories and subcategories...")
        categories_data = [
            {
                "name": "Men's Fashion",
                "subcategories": ["Shirts", "Pants", "Shoes", "Accessories"]
            },
            {
                "name": "Women's Fashion",
                "subcategories": ["Dresses", "Tops", "Skirts", "Bags"]
            },
            {
                "name": "Electronics",
                "subcategories": ["Mobile Phones", "Laptops", "Headphones", "Smart Watches"]
            },
            {
                "name": "Home & Living",
                "subcategories": ["Furniture", "Decor", "Kitchenware", "Bedding"]
            },
            {
                "name": "Sports & Outdoors",
                "subcategories": ["Fitness", "Camping", "Cycling", "Team Sports"]
            }
        ]
        
        created_categories = []
        created_subcategories = []
        
        for category_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=category_data["name"],
                slug=slugify(category_data["name"])
            )
            if created:
                created_categories.append(category)
            
            for subcat_name in category_data["subcategories"]:
                subcategory, created = SubCategory.objects.get_or_create(
                    name=subcat_name,
                    category=category,
                    slug=slugify(f"{category.slug}-{subcat_name}")
                )
                if created:
                    created_subcategories.append(subcategory)
        
        return created_categories, created_subcategories

    def create_shipping_methods(self):
        self.stdout.write("Creating shipping methods...")
        methods = [
            {"name": "Standard Shipping", "price": 5.99, "description": "3-5 business days"},
            {"name": "Express Shipping", "price": 12.99, "description": "1-2 business days"},
            {"name": "Overnight Shipping", "price": 24.99, "description": "Next business day"},
            {"name": "Free Shipping", "price": 0.00, "description": "5-7 business days"},
        ]
        
        created_methods = []
        for method in methods:
            shipping_method, created = ShippingMethod.objects.get_or_create(
                name=method["name"],
                defaults={
                    "price": method["price"],
                    "description": method["description"]
                }
            )
            if created:
                created_methods.append(shipping_method)
        
        return created_methods

    def create_users(self):
        self.stdout.write("Creating users...")
        users = []
        
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            email="admin@example.com",
            defaults={
                "full_name": "Admin User",
                "is_staff": True,
                "is_superuser": True,
                "password": make_password("admin123")
            }
        )
        if created:
            users.append(admin_user)
        
        # Create regular users
        for _ in range(20):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": f"{first_name} {last_name}",
                    "password": make_password("password123")
                }
            )
            if created:
                users.append(user)
        
        return users

    def create_addresses(self, users):
        self.stdout.write("Creating addresses...")
        addresses = []
        
        for user in users:
            for _ in range(random.randint(1, 3)):
                address, created = Address.objects.get_or_create(
                    user=user,
                    address_line_1=fake.street_address(),
                    address_line_2=fake.secondary_address() if random.choice([True, False]) else "",
                    city=fake.city(),
                    state=fake.state(),
                    postal_code=fake.postcode(),
                    country=fake.country(),
                    is_default=random.choice([True, False])
                )
                if created:
                    addresses.append(address)
        
        return addresses

    def create_shops(self, users):
        self.stdout.write("Creating shops...")
        shops = []
        shop_names = [
            "Fashion Haven", "Tech Galaxy", "Home Comforts", "Sports Unlimited",
            "Urban Trends", "Gadget World", "Luxury Living", "Outdoor Adventures",
            "Style Hub", "Digital Dreams"
        ]
        
        # Filter users who don't already have a shop
        available_users = [u for u in users if not hasattr(u, 'shop')]
        
        for name in shop_names:
            if not available_users:
                self.stdout.write(self.style.WARNING("No more available users to assign shops to"))
                break
            
            # Generate unique slug
            base_slug = slugify(name)
            slug = base_slug
            counter = 1
            
            # Ensure slug is unique
            while Shop.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Check if shop name already exists
            if Shop.objects.filter(name=name).exists():
                self.stdout.write(self.style.WARNING(f"Shop with name '{name}' already exists - skipping"))
                continue
            
            owner = random.choice(available_users)
            
            try:
                shop = Shop.objects.create(
                    name=name,
                    owner=owner,
                    slug=slug,
                    description=fake.paragraph(),
                    contact_email=f"contact@{slug}.com",
                    contact_phone=fake.phone_number(),
                    address=fake.street_address(),
                    is_verified=random.choice([True, False])
                )
                shops.append(shop)
                available_users.remove(owner)
                self.stdout.write(f"Created shop: {name}")
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to create shop {name}: {str(e)}"))
                continue
        
        return shops

    def create_products(self, shops, subcategories, colors, sizes):
        self.stdout.write("Creating products...")
        products = []
        
        product_names = [
            "Premium Cotton T-Shirt", "Slim Fit Jeans", "Running Shoes", "Wireless Headphones",
            "Smart Watch", "Leather Wallet", "Ceramic Coffee Mug", "Yoga Mat",
            "Bluetooth Speaker", "Winter Jacket", "Formal Dress Shirt", "Casual Sneakers",
            "Laptop Backpack", "Stainless Steel Water Bottle", "Fitness Tracker",
            "Denim Jacket", "Silk Scarf", "Leather Belt", "Baseball Cap", "Aviator Sunglasses"
        ]
        
        for name in product_names:
            shop = random.choice(shops)
            subcategory = random.choice(subcategories)
            product_colors = random.sample(colors, k=random.randint(1, 3))
            product_sizes = random.sample(sizes, k=random.randint(1, 4))
            
            # Generate realistic prices
            base_price = Decimal(random.randint(10, 200))
            discount_price = base_price * Decimal(random.uniform(0.7, 0.95)) if random.choice([True, False]) else None
            
            # Generate unique slug
            base_slug = slugify(f"{shop.name} {name}")
            slug = base_slug
            counter = 1
            
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            try:
                product = Product.objects.create(
                    name=name,
                    shop=shop,
                    sub_category=subcategory,
                    slug=slug,
                    description='\n'.join(fake.paragraphs(nb=3)),
                    price=base_price,
                    discount_price=discount_price,
                    stock=random.randint(0, 100),
                    is_active=random.choice([True, False])
                )
                
                # Add colors and sizes
                product.colors.set(product_colors)
                product.sizes.set(product_sizes)
                products.append(product)
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to create product {name}: {str(e)}"))
                continue
        
        return products

    def create_product_additional_data(self, products):
        self.stdout.write("Creating product additional data...")
        
        for product in products:
            # Additional images
            for _ in range(random.randint(1, 4)):
                try:
                    ProductAdditionalImage.objects.create(
                        product=product,
                        image=self.generate_image()
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(
                        f"Failed to generate image for product {product.id}: {str(e)}"
                    ))
                    continue
            
            # Additional descriptions
            if random.choice([True, False]):
                try:
                    ProductAdditionalDescription.objects.create(
                        product=product,
                        description='\n'.join(fake.paragraphs(nb=2))
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(
                        f"Failed to create description for product {product.id}: {str(e)}"
                    ))
            
            # Specifications
            specs = [
                ("Material", random.choice(["Cotton", "Polyester", "Leather", "Silk", "Denim"])),
                ("Weight", f"{random.randint(100, 500)}g"),
                ("Dimensions", f"{random.randint(10, 50)}x{random.randint(10, 50)}x{random.randint(1, 10)} cm"),
                ("Warranty", f"{random.randint(1, 3)} year(s)"),
                ("Country of Origin", fake.country())
            ]
            
            for name, value in random.sample(specs, k=random.randint(2, len(specs))):
                try:
                    ProductSpecification.objects.create(
                        product=product,
                        name=name,
                        value=value
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(
                        f"Failed to create specification for product {product.id}: {str(e)}"
                    ))

    def generate_image(self, width=300, height=300):
        from PIL import ImageDraw
        image = Image.new('RGB', (width, height))
        draw = ImageDraw.Draw(image)
        
        # Generate a random background color
        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        draw.rectangle([(0, 0), (width, height)], fill=color)
        
        # Add some random shapes
        for _ in range(random.randint(3, 10)):
            shape_color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
            
            # Ensure proper coordinates
            x0 = random.randint(0, width - 10)
            y0 = random.randint(0, height - 10)
            x1 = random.randint(x0 + 1, width)
            y1 = random.randint(y0 + 1, height)
            
            if random.choice([True, False]):
                draw.ellipse([(x0, y0), (x1, y1)], fill=shape_color)
            else:
                draw.rectangle([(x0, y0), (x1, y1)], fill=shape_color)
        
        # Save to BytesIO
        image_io = BytesIO()
        image.save(image_io, format='JPEG')
        
        return ContentFile(image_io.getvalue(), name=f"{fake.word()}.jpg")

    def create_reviews(self, products, users):
        self.stdout.write("Creating reviews...")
        
        for product in products:
            for _ in range(random.randint(0, 10)):
                user = random.choice(users)
                try:
                    Review.objects.create(
                        user=user,
                        product=product,
                        rating=random.randint(1, 5),
                        comment=fake.paragraph()
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(
                        f"Failed to create review for product {product.id} by user {user.id}: {str(e)}"
                    ))

    def create_orders(self, users, addresses, shipping_methods):
        self.stdout.write("Creating orders...")
        orders = []
        
        for _ in range(50):
            user = random.choice(users)
            user_addresses = [a for a in addresses if a.user == user]
            if not user_addresses:
                continue
                
            address = random.choice(user_addresses)
            shipping_method = random.choice(shipping_methods)
            
            try:
                order = Order.objects.create(
                    user=user,
                    shipping_address=address,
                    shipping_method=shipping_method,
                    total_amount=0,  # Will be updated after items are added
                    status=random.choice(Order.OrderStatus.values),
                    payment_status=random.choice(Order.PaymentStatus.values)
                )
                orders.append(order)
            except Exception as e:
                self.stdout.write(self.style.WARNING(
                    f"Failed to create order: {str(e)}"
                ))
                continue
        
        return orders

    def create_order_items(self, orders, products, colors, sizes):
        self.stdout.write("Creating order items...")
        
        for order in orders:
            order_total = Decimal('0')
            items_count = random.randint(1, 5)
            
            for _ in range(items_count):
                product = random.choice(products)
                available_colors = list(product.colors.all())
                color = random.choice(available_colors) if available_colors else None
                available_sizes = list(product.sizes.all())
                size = random.choice(available_sizes) if available_sizes else None
                quantity = random.randint(1, 3)
                
                # Use discount price if available, otherwise regular price
                price = product.discount_price if product.discount_price else product.price
                item_total = price * quantity
                order_total += item_total
                
                try:
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        color=color,
                        size=size,
                        quantity=quantity,
                        unit_price=price
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(
                        f"Failed to create order item for order {order.id}: {str(e)}"
                    ))
                    continue
            
            # Update order total
            try:
                order.total_amount = order_total
                order.save()
            except Exception as e:
                self.stdout.write(self.style.WARNING(
                    f"Failed to update order total for order {order.id}: {str(e)}"
                ))

    def create_order_updates(self, orders):
        self.stdout.write("Creating order updates...")
        
        status_flow = [
            Order.OrderStatus.PENDING,
            Order.OrderStatus.PROCESSING,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.DELIVERED
        ]
        
        for order in orders:
            current_status_index = status_flow.index(order.status) if order.status in status_flow else 0
            
            for i in range(current_status_index + 1):
                status = status_flow[i]
                notes = {
                    Order.OrderStatus.PENDING: "Order received and awaiting processing",
                    Order.OrderStatus.PROCESSING: "Order is being prepared for shipment",
                    Order.OrderStatus.SHIPPED: f"Order shipped with tracking number {fake.uuid4()}",
                    Order.OrderStatus.DELIVERED: "Order has been successfully delivered"
                }.get(status, "")
                
                try:
                    OrderUpdate.objects.create(
                        order=order,
                        status=status,
                        notes=notes
                    )
                except Exception as e:
                    self.stdout.write(self.style.WARNING(
                        f"Failed to create order update for order {order.id}: {str(e)}"
                    ))