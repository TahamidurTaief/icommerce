<p align="center">
  <img src="frontend/public/icommerce-icon.jpg" alt="iCommerce" width="96" height="96" />
</p>
<h1 align="center">iCommerce – E‑commerce Web Application</h1>
<p align="center">Client‑friendly documentation for managing your online store</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white" alt="Python"></a>
  <a href="https://www.djangoproject.com/"><img src="https://img.shields.io/badge/Django-5.x-092E20?logo=django&logoColor=white" alt="Django"></a>
  <a href="https://www.django-rest-framework.org/"><img src="https://img.shields.io/badge/DRF-API-red?logo=fastapi&logoColor=white" alt="DRF"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" alt="Next.js"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind"></a>
</p>

> Tip: This guide is written for non‑technical users. Follow the steps and screenshots you see in your Admin to manage the store confidently.

---

## Table of Contents

- [1) Introduction](#1-introduction)
- [2) Database Structure & Django Apps](#2-database-structure--django-apps)
  - [Apps overview](#apps-overview)
  - [Models explained in plain English](#models-explained-in-plain-english)
  - [How the database represents your store](#how-the-database-represents-your-store)
- [3) How to Upload Products (Django Admin)](#3-how-to-upload-products-django-admin)
- [4) Frontend Pages (Storefront)](#4-frontend-pages-storefront)
- [5) Order Management (Back Office)](#5-order-management-back-office)
- [6) Additional Notes](#6-additional-notes)

---

## 1) Introduction

- What it is
  - A full e‑commerce platform with an admin dashboard to manage products, categories, orders, and customers, and a modern storefront for shoppers.
- Technologies used
  - Backend: Django 5 (Python), Django REST Framework (secure APIs), Simple JWT (login/auth), Redis cache (performance)
  - Admin UI: Django Admin with Unfold theme (clean, user‑friendly), Import‑Export (bulk CSV/Excel), CKEditor (rich text editor)
  - Frontend: Next.js (React), Tailwind CSS, modern UI components and animations
  - Media: Image uploads (thumbnails and galleries), served via Django
- Core features
  - Product catalog with categories, sub‑categories, colors, sizes, specifications, and rich descriptions
  - Cart, checkout, shipping methods, discount coupons, and order tracking
  - Customer accounts with addresses; seller/shop profiles
  - Manual payment capture records (bKash, Nagad, Card), with reference/transaction ID logging
  - Search/filtering, pagination, and SEO‑friendly product URLs

> Why clients like it: Clean admin, flexible product options, and clear order tracking from purchase to delivery.

---

## 2) Database Structure & Django Apps

The system is organized into separate Django apps. Each app focuses on one area of the business.

### Apps overview

- users — manages accounts and shipping addresses
- shops — manages a seller/shop profile (products belong to a shop)
- products — manages categories, products, options, images, and reviews
- orders — manages orders, shipping, coupons, payments, and status updates

### Models explained in plain English

- users
  - User
    - Who: Every person who logs in (customers, sellers, admins)
    - Key details: Email (login), name, role (Customer/Seller/Admin), active/staff flags, joined date
  - Address
    - What: Saved shipping addresses for a user
    - Fields: Address lines, city, state/region, postal code, country, default flag

- shops
  - Shop
    - What: A seller profile that owns products
    - Fields: Owner (user), name, slug (SEO link), description, logo/cover, contact email/phone, address, active/verified flags

- products
  - Category
    - What: Top‑level grouping (e.g., Electronics)
    - Fields: Name, image, slug
  - SubCategory
    - What: A category subsection (e.g., Mobile Phones under Electronics)
    - Fields: Name, image, slug, linked to a Category
  - Color
    - What: A color option customers can choose
    - Fields: Color name and HEX code
  - Size
    - What: A size option customers can choose (e.g., S, M, L or numeric)
    - Fields: Size name
  - Product
    - What: A sellable item in your store
    - Fields: Shop (owner), name, slug, rich description, sub‑category, price, optional discount price, stock, active flag
    - Media: Thumbnail image and an image gallery (additional images)
    - Options: Many colors and sizes can be attached
    - Dates: Created/updated automatically
  - ProductAdditionalImage — extra images for the product gallery
  - ProductAdditionalDescription — rich extra content (e.g., long form description, care guide)
  - ProductSpecification — key specs like Material, Weight (name/value pairs; unique per product)
  - Review — customer rating (1–5) and optional comment; one review per customer per product

- orders
  - ShippingMethod
    - What: Delivery options (e.g., Door to Door)
    - Fields: Name, description, base price, estimated delivery time, active flag
    - Pricing: Can have quantity‑based pricing tiers
  - ShippingTier — price tiers based on number of items (e.g., 5+ items cheaper per order)
  - Coupon — discount rules (product/cart total/shipping/first‑time/user‑specific)
  - Order
    - What: The customer’s purchase record
    - Fields: Order number, totals (cart subtotal and grand total), status (Pending/Processing/Shipped/Delivered/Cancelled), payment status (Pending/Paid/Failed)
    - Customer info: Name, email, phone
    - Shipping: Address, shipping method, tracking number
    - Timestamps: Order date
  - OrderItem — each product line in an order (product, chosen color/size, quantity, unit price)
  - OrderUpdate — a timeline entry (status + notes) for progress (e.g., “Left warehouse”)
  - OrderPayment — payment record (method, admin account, customer sender number, transaction/reference ID)

### How the database represents your store

- Products and categories
  - Products belong to a Sub‑Category; Sub‑Categories belong to a Category
  - Products can have colors, sizes, images, and specifications
- Customers and addresses
  - Each customer can save multiple shipping addresses; one can be marked default
- Orders and payments
  - An Order links to the customer (if logged in), shipping address, shipping method, and has items (OrderItem)
  - Coupons can validate and discount product totals and/or shipping
  - Payments are logged as records with transaction/reference details (suitable for manual verification)

---

## 3) How to Upload Products (Django Admin)

1) Log in to the Admin
- Visit <code>/admin</code> using your admin email and password
- You’ll see a clean dashboard (Unfold theme)

2) Prepare categories (first time only)
- Add Categories (name, image, slug)
- Add Sub‑Categories (choose the parent Category)

3) Add product options (optional)
- Colors: Add common color names and HEX codes once (reusable)
- Sizes: Add size names (e.g., S, M, L, 42)

4) Add a product
- Go to Products → Add
- Required details:
  - Name and Slug (URL link; slug can be auto‑generated by staff)
  - Description (use the rich text editor)
  - Sub‑Category (choose where it belongs)
  - Price (and optional discount price)
  - Stock quantity (how many you can sell)
  - Active: Turn off to temporarily hide a product
  - Images:
    - Thumbnail (main image)
    - Additional Images (gallery; you can add multiple)
  - Options:
    - Choose available Colors and Sizes for this product
  - Specifications: Add name/value pairs (e.g., Material: Cotton)
- Save to publish

5) Tips
- Start with a clear thumbnail image and at least 2–4 gallery images
- Use short but descriptive names and keep slugs simple and unique
- Use specifications for factual attributes; use Colors/Sizes only for selectable options

---

## 4) Frontend Pages (Storefront)

The storefront is built with Next.js for speed and a smooth experience.

- / (Homepage)
  - Highlights featured products and categories
  - Search, promotional banners, and quick links
- /category/
  - Lists all product categories; click a category to drill down
- /products/
  - Shows product listings with pagination
  - Filtering and sorting by category, price, color/size (depending on design)
- /cart/
  - Shows selected items, chosen options (color/size), quantities, and subtotals
  - You can update quantities, remove items, apply coupons
- /checkout/
  - Collects customer details (name, email, phone)
  - Lets customers select/save a shipping address
  - Shows shipping methods and costs; supports coupons
  - Payment step records bKash/Nagad/Card details (transaction/reference ID)
- /confirmation/
  - Displays a success message with order number
  - Shows a summary: items, totals, shipping method, and contact details

> Note: Your live menu can show only the shopper‑facing pages you want. Internal QA pages (e.g., coupon/payment tests) can be hidden.

---

## 5) Order Management (Back Office)

- How orders are stored
  - Each order has a unique order number (e.g., <code>ORD‑YYYYMMDD‑XXXXXX</code>)
  - Items (products, quantities, chosen color/size) are attached to the order
  - Totals include cart subtotal, shipping, and discounts (if any)

- Updating order status
  - In Admin → Orders, open an order and change its Status (Pending, Processing, Shipped, Delivered, Cancelled)
  - Add an Order Update note to record milestones (e.g., tracking events)
  - Enter a tracking number when available

- Payments
  - Admins can view the linked Order Payment
  - Record the payment method, admin account, customer sender number, and transaction/ref ID
  - Set Payment Status on the Order (Pending/Paid/Failed) after verification

- Notifications
  - Email notifications are not enabled by default but can be added if required (order confirmations, status updates, etc.)

---

## 6) Additional Notes

- Dependencies (key)
  - Django, Django REST Framework, Simple JWT, django‑unfold, django‑import‑export, django‑ckeditor, django‑filter, Pillow (images), django‑redis/redis
  - Frontend: Next.js, React, Tailwind CSS, Swiper, React Icons, etc.

- Environment & configuration
  - Typical environment variables for production:
    - <code>DJANGO_SECRET_KEY</code>
    - <code>DJANGO_DEBUG</code> (False in production)
    - <code>DJANGO_ALLOWED_HOSTS</code> (comma‑separated domain names)
    - <code>DATABASE_URL</code> (e.g., PostgreSQL connection string) or SQLite default
    - <code>REDIS_URL</code> (for caching)
    - <code>CORS_ALLOWED_ORIGINS</code> and <code>CSRF_TRUSTED_ORIGINS</code> (frontend URLs/domains)
    - MEDIA and STATIC settings according to hosting
  - Authentication: Uses secure token‑based authentication (JWT) for APIs

- Files & uploads
  - Static files (admin UI, CSS/JS) are collected into <code>/staticfiles</code>
  - Media uploads (product images) are stored in <code>/mediafiles</code>
  - Product images live under <code>products/thumbnails/</code> and <code>products/additional_images/</code>

- Third‑party integrations
  - Payments: The system records payment details for bKash, Nagad, and Card as part of the order; it is set up for manual verification. Live gateway integrations can be added later if desired.
  - Shipping: Multiple shipping methods and quantity‑based pricing tiers are supported. Integration with a courier API can be added if needed.

- Accessing the admin
  - Visit <code>/admin</code> and use your admin account
  - The admin interface supports CSV/Excel import/export for bulk operations (products, categories, etc.)

- Data safety
  - Only share the admin panel with trusted staff
  - Keep image sizes reasonable for faster page loads
  - Back up the database regularly, especially before large imports

- Support & changes
  - If you need new product attributes, coupon rules, or custom reports, they can be added without disrupting existing data

---

<p align="center">
  <em>If you need help managing products, orders, or settings, please reach out. We’re happy to assist.</em>
</p>
