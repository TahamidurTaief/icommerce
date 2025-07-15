// components/Product/ProductInfo.jsx
"use client";

import { useState, useEffect } from "react";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { toast } from "react-toastify";

export default function ProductInfo({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  handleAddToCart,
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // UPDATED: Check local storage on mount to set initial wishlist state
  useEffect(() => {
    const wishlistItems = JSON.parse(
      localStorage.getItem("wishlistItems") || "[]"
    );
    const exists = wishlistItems.some((item) => item.slug === product.slug);
    setIsWishlisted(exists);
  }, [product.slug]);

  const productPrice = product.price || 0;
  const originalPrice = product.originalPrice || product.price || 0;
  const discount =
    originalPrice > productPrice
      ? Math.round(((originalPrice - productPrice) / originalPrice) * 100)
      : 0;

  // UPDATED: Handle adding/removing from wishlist in local storage
  const handleAddToWishlist = () => {
    const wishlistItems = JSON.parse(
      localStorage.getItem("wishlistItems") || "[]"
    );
    const existingIndex = wishlistItems.findIndex(
      (item) => item.slug === product.slug
    );

    if (existingIndex > -1) {
      // Item exists, so remove it
      wishlistItems.splice(existingIndex, 1);
      localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
      setIsWishlisted(false);
      toast.info(`💔 ${product.name} removed from wishlist!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      // Item does not exist, so add it
      const itemToAdd = { ...product, type: "wishlist" };
      wishlistItems.push(itemToAdd);
      localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
      setIsWishlisted(true);
      toast.success(`❤️ ${product.name} added to wishlist!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="bg-[var(--color-second-bg)] p-6 rounded-lg shadow-md h-full flex flex-col">
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
        {product.category}
      </span>

      <div className="flex flex-row justify-between items-baseline w-full gap-4">
        <h1 className="text-lg md:text-2xl font-extrabold text-foreground mb-3 leading-tight">
          {product.name}
        </h1>

        <button
          onClick={handleAddToWishlist}
          className={`font-bold text-lg transition-colors duration-300 flex items-center justify-center ${
            isWishlisted
              ? "border-destructive text-destructive"
              : "border-border text-foreground "
          }`}
        >
          <LuHeart
            className={`text-xl ${isWishlisted ? "fill-current" : ""}`}
          />
          <span className="ml-2 hidden sm:inline">Save</span>
        </button>
      </div>
      {product.rating && (
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating)
                    ? "fill-current"
                    : "stroke-current text-gray-300 dark:text-gray-600"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviews || 0} reviews)
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 mb-6 p-4 bg-primary/10 rounded-lg">
        <span className="text-xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
          ${productPrice.toFixed(2)}
        </span>
        {originalPrice > productPrice && (
          <span className="text-md text-muted-foreground line-through">
            ${originalPrice.toFixed(2)}
          </span>
        )}
        {discount > 0 && (
          <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full ml-2">
            -{discount}% OFF
          </span>
        )}
      </div>
      {product.colors && product.colors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-foreground mb-3">
            Color:{" "}
            <span className="font-normal text-muted-foreground">
              {product.colors.find((c) => c.hex === selectedColor)?.name ||
                "N/A"}
            </span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color.hex)}
                className={`w-5 h-5 md:w-10 md:h-10 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color.hex
                    ? "ring-4 ring-offset-2 ring-primary-500 dark:ring-primary-400 border-primary-500 dark:ring-offset-gray-800"
                    : "border-border hover:border-primary-400"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-foreground mb-3">
            Size:{" "}
            <span className="font-normal text-muted-foreground">
              {selectedSize || "N/A"}
            </span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-2 text-center items-center md:px-5 md:py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                  selectedSize === size
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        {/* <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-bold text-lg transition-colors duration-300 shadow-md ${
            product.inStock
              ? "bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary border border-primary"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <LuShoppingCart className="mr-2 text-xl" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button> */}
        {/* <button
          onClick={handleAddToWishlist}
          className={`py-3 px-6 rounded-lg border-2 font-bold text-lg transition-colors duration-300 shadow-md flex items-center justify-center ${
            isWishlisted
              ? "border-destructive text-destructive bg-destructive/10"
              : "border-border text-foreground hover:bg-muted"
          }`}
        >
          <LuHeart
            className={`text-xl ${isWishlisted ? "fill-current" : ""}`}
          />
          <span className="ml-2 hidden sm:inline">Save</span>
        </button> */}
      </div>
      <div className="mt-8 pt-6 border-t border-border text-muted-foreground text-sm">
        <p className="mb-1">
          <span className="font-semibold text-foreground">SKU:</span>{" "}
          {product.sku}
        </p>
        <p className="mb-1">
          <span className="font-semibold text-foreground">Brand:</span>{" "}
          {product.brand}
        </p>
        <p>
          <span className="font-semibold text-foreground">Availability:</span>{" "}
          {product.inStock ? (
            <span className="text-color-accent-green font-medium">
              In Stock
            </span>
          ) : (
            <span className="text-destructive font-medium">Out of Stock</span>
          )}
        </p>
      </div>
    </div>
  );
}
