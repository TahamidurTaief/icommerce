"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import baby_fashion from "@/public/img/Home/Caregory/baby-fashion.jpg";
import men_fashion from "@/public/img/Home/Caregory/men-fashion.jpeg";
import gadget_img from "@/public/img/Home/Caregory/gadget_img.jpg";
import girls_bag from "@/public/img/Home/Caregory/girls-bag.jpeg";
import girls_fashion from "@/public/img/Home/Caregory/girs-fashion-dress.jpeg";
import cosmatic from "@/public/img/Home/Caregory/cosmatic.jpg";
import CategoryCard from "../Common/CategoryCard";
import AllCategoryComponents from "../Common/AllCategoryComponents";
import ProductCard from "../Common/ProductCard";

const CategoriesBlock = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const TopCategories = [
    {
      id: 1,
      title: "Baby Fashion",
      icon: baby_fashion,
      images: [baby_fashion, men_fashion, girls_fashion, cosmatic],
      total_products: 22,
      sub_categories: 5,
    },
    {
      id: 2,
      title: "Men's Fashion",
      icon: men_fashion,
      images: [men_fashion, gadget_img, girls_bag, cosmatic],
      total_products: 15,
      sub_categories: 3,
    },
    {
      id: 3,
      title: "Women's Bags",
      icon: girls_bag,
      images: [girls_bag, baby_fashion, men_fashion, cosmatic],
      total_products: 30,
      sub_categories: 8,
    },
    {
      id: 4,
      title: "Cosmetics",
      icon: cosmatic,
      images: [cosmatic, girls_fashion, baby_fashion, gadget_img],
      total_products: 42,
      sub_categories: 12,
    },
    {
      id: 5,
      title: "Baby Fashion",
      icon: baby_fashion,
      images: [baby_fashion, men_fashion, girls_fashion, cosmatic],
      total_products: 22,
      sub_categories: 5,
    },
    {
      id: 6,
      title: "Men's Fashion",
      icon: men_fashion,
      images: [men_fashion, gadget_img, girls_bag, cosmatic],
      total_products: 15,
      sub_categories: 3,
    },
  ];

  const Category_data = [
    {
      id: 1,
      title: "Baby Fashion",
      icon: baby_fashion,
      images: [baby_fashion, men_fashion, girls_fashion, cosmatic],
      total_products: 22,
      sub_categories: 5,
    },
    {
      id: 2,
      title: "Men's Fashion",
      icon: men_fashion,
      images: [men_fashion, gadget_img, girls_bag, cosmatic],
      total_products: 15,
      sub_categories: 3,
    },
    {
      id: 3,
      title: "Women's Bags",
      icon: girls_bag,
      images: [girls_bag, baby_fashion, men_fashion, cosmatic],
      total_products: 30,
      sub_categories: 8,
    },
    {
      id: 4,
      title: "Cosmetics",
      icon: cosmatic,
      images: [cosmatic, girls_fashion, baby_fashion, gadget_img],
      total_products: 42,
      sub_categories: 12,
    },
    {
      id: 11,
      title: "Baby Fashion",
      icon: baby_fashion,
      images: [baby_fashion, men_fashion, girls_fashion, cosmatic],
      total_products: 22,
      sub_categories: 5,
    },
    {
      id: 21,
      title: "Men's Fashion",
      icon: men_fashion,
      images: [men_fashion, gadget_img, girls_bag, cosmatic],
      total_products: 15,
      sub_categories: 3,
    },
    {
      id: 31,
      title: "Women's Bags",
      icon: girls_bag,
      images: [girls_bag, baby_fashion, men_fashion, cosmatic],
      total_products: 30,
      sub_categories: 8,
    },
    {
      id: 41,
      title: "Cosmetics",
      icon: cosmatic,
      images: [cosmatic, girls_fashion, baby_fashion, gadget_img],
      total_products: 42,
      sub_categories: 12,
    },
    {
      id: 12,
      title: "Baby Fashion",
      icon: baby_fashion,
      images: [baby_fashion, men_fashion, girls_fashion, cosmatic],
      total_products: 22,
      sub_categories: 5,
    },
    {
      id: 22,
      title: "Men's Fashion",
      icon: men_fashion,
      images: [men_fashion, gadget_img, girls_bag, cosmatic],
      total_products: 15,
      sub_categories: 3,
    },
    {
      id: 32,
      title: "Women's Bags",
      icon: girls_bag,
      images: [girls_bag, baby_fashion, men_fashion, cosmatic],
      total_products: 30,
      sub_categories: 8,
    },
    {
      id: 42,
      title: "Cosmetics",
      icon: cosmatic,
      images: [cosmatic, girls_fashion, baby_fashion, gadget_img],
      total_products: 42,
      sub_categories: 12,
    },
    {
      id: 13,
      title: "Baby Fashion",
      icon: baby_fashion,
      images: [baby_fashion, men_fashion, girls_fashion, cosmatic],
      total_products: 22,
      sub_categories: 5,
    },
    {
      id: 23,
      title: "Men's Fashion",
      icon: men_fashion,
      images: [men_fashion, gadget_img, girls_bag, cosmatic],
      total_products: 15,
      sub_categories: 3,
    },
    {
      id: 33,
      title: "Women's Bags",
      icon: girls_bag,
      images: [girls_bag, baby_fashion, men_fashion, cosmatic],
      total_products: 30,
      sub_categories: 8,
    },
    {
      id: 43,
      title: "Cosmetics",
      icon: cosmatic,
      images: [cosmatic, girls_fashion, baby_fashion, gadget_img],
      total_products: 42,
      sub_categories: 12,
    },
  ];

  const productData = [
    {
      name: "Cotton Fabric T-Shirt for Kids",
      category: "Baby Fashion",
      imageUrl: "/img/Home/Caregory/baby-fashion.jpg",
      description:
        "A comfortable and stylish 100% cotton t-shirt, perfect for everyday wear for kids.",
      price: 12.0,
      originalPrice: 15.0,
      currency: "USD",
      sizes: ["S", "M", "XL"],
      colors: [
        { name: "Purple", hex: "#a855f7" },
        { name: "Pink", hex: "#ec4899" },
        { name: "Gray", hex: "#9ca3af" },
      ],
      sku: "TSHIRT-COTTON-KID-001",
      brand: "Issl Commerce Apparel",
      slug: "cotton-fabric-t-shirt-for-kids",
      rating: 4.5,
      reviews: 24,
      inStock: true,
    },
    {
      name: "Denim Jeans for Toddlers",
      category: "Baby Fashion",
      imageUrl: "/img/Home/Caregory/men-fashion.jpeg",
      description: "Durable denim jeans with elastic waistband for comfort.",
      price: 18.0,
      originalPrice: 25.0,
      currency: "USD",
      sizes: ["S", "M", "L"],
      colors: [
        { name: "Blue", hex: "#3b82f6" },
        { name: "Black", hex: "#000000" },
      ],
      sku: "JEANS-DENIM-TOD-002",
      brand: "Issl Commerce Apparel",
      slug: "denim-jeans-for-toddlers",
      rating: 4.2,
      reviews: 18,
      inStock: true,
    },
    {
      name: "Winter Jacket for Kids",
      category: "Baby Fashion",
      imageUrl: "/img/Home/Caregory/gadget_img.jpg",
      description: "Warm winter jacket with waterproof outer layer.",
      price: 35.0,
      originalPrice: 45.0,
      currency: "USD",
      sizes: ["S", "M", "L", "XL"],
      colors: [],
      sku: "JACKET-WINTER-KID-003",
      brand: "Issl Commerce Apparel",
      slug: "winter-jacket-for-kids",
      rating: 4.7,
      reviews: 32,
      inStock: true,
    },
    {
      name: "Stylish Girls Bag",
      category: "Women's Bags",
      imageUrl: "/img/Home/Caregory/girls-bag.jpeg",
      description: "Fashionable bag for girls with multiple compartments.",
      price: 22.0,
      originalPrice: 30.0,
      currency: "USD",
      sizes: ["One Size"],
      colors: [],
      sku: "BAG-GIRLS-004",
      brand: "Issl Commerce Apparel",
      slug: "stylish-girls-bag",
      rating: 4.3,
      reviews: 15,
      inStock: true,
    },
    {
      name: "Girls Fashion Dress",
      category: "Baby Fashion",
      imageUrl: "/img/Home/Caregory/girs-fashion-dress.jpeg",
      description: "Beautiful summer dress for girls with floral pattern.",
      price: 28.0,
      originalPrice: 35.0,
      currency: "USD",
      sizes: ["S", "M", "L"],
      colors: [],
      sku: "DRESS-GIRLS-005",
      brand: "Issl Commerce Apparel",
      slug: "girls-fashion-dress",
      rating: 4.6,
      reviews: 27,
      inStock: true,
    },
    {
      name: "Cosmetic Set",
      category: "Cosmetics",
      imageUrl: "/img/Home/Caregory/cosmatic.jpg",
      description: "Complete cosmetic set with natural ingredients.",
      price: 42.0,
      originalPrice: 55.0,
      currency: "USD",
      sizes: ["Set"],
      colors: [],
      sku: "COSMETIC-SET-006",
      brand: "Issl Commerce Beauty",
      slug: "cosmetic-set",
      rating: 4.4,
      reviews: 38,
      inStock: true,
    },
    {
      name: "Smart Watch",
      category: "Men's Fashion",
      imageUrl: "/img/Home/Caregory/gadget_img.jpg",
      description: "Feature-rich smart watch with health monitoring.",
      price: 89.0,
      originalPrice: 120.0,
      currency: "USD",
      sizes: ["Standard"],
      colors: [],
      sku: "WATCH-SMART-007",
      brand: "Issl Commerce Tech",
      slug: "smart-watch",
      rating: 4.8,
      reviews: 45,
      inStock: true,
    },
    {
      name: "Men's Fashion Shirt",
      category: "Men's Fashion",
      imageUrl: "/img/Home/Caregory/men-fashion.jpeg",
      description: "Premium quality shirt for men with slim fit.",
      price: 32.0,
      originalPrice: 45.0,
      currency: "USD",
      sizes: ["S", "M", "L", "XL"],
      colors: [],
      sku: "SHIRT-MEN-008",
      brand: "Issl Commerce Apparel",
      slug: "mens-fashion-shirt",
      rating: 4.1,
      reviews: 21,
      inStock: true,
    },
    {
      name: "Wireless Earbuds",
      category: "Men's Fashion",
      imageUrl: "/img/Home/Caregory/gadget_img.jpg",
      description: "High-quality wireless earbuds with noise cancellation.",
      price: 59.0,
      originalPrice: 79.0,
      currency: "USD",
      sizes: ["Standard"],
      colors: [
        { name: "White", hex: "#ffffff" },
        { name: "Black", hex: "#000000" },
      ],
      sku: "EARBUDS-WIRELESS-009",
      brand: "Issl Commerce Tech",
      slug: "wireless-earbuds",
      rating: 4.5,
      reviews: 56,
      inStock: true,
    },
    {
      name: "Leather Wallet",
      category: "Women's Bags",
      imageUrl: "/img/Home/Caregory/girls-bag.jpeg",
      description: "Genuine leather wallet with multiple card slots.",
      price: 24.0,
      originalPrice: 35.0,
      currency: "USD",
      sizes: ["One Size"],
      colors: [
        { name: "Brown", hex: "#8B4513" },
        { name: "Black", hex: "#000000" },
      ],
      sku: "WALLET-LEATHER-010",
      brand: "Issl Commerce Apparel",
      slug: "leather-wallet",
      rating: 4.3,
      reviews: 19,
      inStock: true,
    },
  ];

  const filteredProducts = selectedCategory
    ? productData.filter((product) => product.category === selectedCategory)
    : productData;

  const handleCategorySelect = (categoryTitle) => {
    setSelectedCategory(
      selectedCategory === categoryTitle ? null : categoryTitle
    );
  };

  return (
    <div className="container w-full mx-auto pt-5 md:pt-5 py-10 md:py-20">
      {/* Top Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-2xl lg:text-3xl font-bold mb-6">
          Top <span className="text-sky-500">Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {TopCategories.map((data) => (
            <CategoryCard
              key={data.id}
              id={data.id}
              title={data.title}
              images={data.images}
              total_products={data.total_products}
              sub_categories={data.sub_categories}
            />
          ))}
        </div>
      </section>

      {/* All Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-2xl xl:text-3xl font-bold mb-6">
          All <span className="text-sky-500">Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Category_data.map((data) => (
            <AllCategoryComponents
              key={data.id}
              id={data.id}
              icon={data.icon}
              title={data.title}
              isSelected={selectedCategory === data.title}
              onClick={() => handleCategorySelect(data.title)}
            />
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section>
        <h2 className="text-2xl md:text-2xl lg:text-3xl font-bold mb-6">
          {selectedCategory ? (
            <>
              Filtered <span className="text-sky-500">Products</span>
              <span className="ml-2 text-sm font-normal bg-sky-100 text-sky-800 px-3 py-1 rounded-full">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-2 text-sky-600 hover:text-sky-800"
                >
                  ×
                </button>
              </span>
            </>
          ) : (
            <>
              Featured <span className="text-sky-500">Products</span>
            </>
          )}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.sku} productData={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CategoriesBlock;
