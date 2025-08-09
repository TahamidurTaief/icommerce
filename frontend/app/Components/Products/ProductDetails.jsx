"use client";
import Image from "next/image";
import { useState } from "react";
import { useMessage } from "@/context/MessageContext";
import { LuShoppingCart, LuHeart } from "react-icons/lu";

export default function ProductDetails({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.hex || null
  );
  const [selectedSize, setSelectedSize] = useState(
    Array.isArray(product.sizes)
      ? product.sizes[0]
      : typeof product.sizes === "string"
      ? product.sizes.split(" ")[0]
      : null
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { showSuccess, showError } = useMessage();

  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === "string"
    ? product.sizes.split(" ")
    : [];

  const handleAddToCart = () => {
    showSuccess(`${product.name} added to cart!`, 'Added to Cart');
    // Add to cart logic here
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (isWishlisted) {
      showSuccess(`${product.name} removed from wishlist!`, 'Wishlist Updated');
    } else {
      showSuccess(`${product.name} added to wishlist!`, 'Added to Wishlist');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div>
        <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
          <Image
            src={product.images?.[selectedImage] || product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                  selectedImage === i ? "border-blue-500" : "border-transparent"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

        {product.rating && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-500 ml-1">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
            <span
              className={`text-sm ${
                product.inStock ? "text-green-600" : "text-gray-500"
              }`}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        )}

        <div className="mb-6">
          <span className="text-3xl font-bold">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="ml-2 text-lg text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="ml-2 text-red-500 font-medium">
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100
              )}
              % OFF
            </span>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Color Selection */}
        {product.colors?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Color:</h4>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === color.hex
                      ? "ring-2 ring-offset-2"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    "--tw-ring-color": color.hex,
                  }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Size:</h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedSize === size
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Quantity:</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              product.inStock
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
          <button
            onClick={handleAddToWishlist}
            className={`p-3 rounded-lg border flex items-center justify-center ${
              isWishlisted
                ? "bg-red-50 border-red-200 text-red-600"
                : "border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <LuHeart
              className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
