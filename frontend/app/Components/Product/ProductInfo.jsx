// app/Components/Product/ProductInfo.jsx
"use client";

import { useState, useEffect } from "react";
import { LuHeart } from "react-icons/lu";
import { toast } from "react-toastify";

export default function ProductInfo({ product, selectedColor, setSelectedColor, selectedSize, setSelectedSize }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    // You can add logic here to check if the item is in a wishlist (e.g., from localStorage)
  }, [product.slug]);

  const price = parseFloat(product.discount_price) || parseFloat(product.price) || 0;
  const originalPrice = parseFloat(product.price) || 0;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const inStock = product.stock > 0 && product.is_active;

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.info(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="bg-[var(--color-second-bg)] p-6 rounded-lg shadow-md h-full flex flex-col">
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
        {product.sub_category?.category?.name || 'Category'}
      </span>

      <div className="flex flex-row justify-between items-start w-full gap-4">
        <h1 className="text-lg md:text-2xl font-extrabold text-foreground mb-3 leading-tight">
          {product.name}
        </h1>
        <button onClick={handleAddToWishlist} className={`p-2 rounded-full transition-colors duration-300 ${isWishlisted ? "text-red-500 bg-red-100" : "text-foreground hover:bg-muted"}`}>
          <LuHeart className={`text-xl ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>
      
      {product.review_count > 0 && (
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-current" : "stroke-current text-gray-300"}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 p-4 bg-primary/10 rounded-lg">
        <span className="text-xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">${price.toFixed(2)}</span>
        {discount > 0 && <span className="text-md text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>}
        {discount > 0 && <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full ml-2">-{discount}% OFF</span>}
      </div>

      {product.colors && product.colors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-foreground mb-3">Color: <span className="font-normal text-muted-foreground">{product.colors.find(c => c.hex === selectedColor)?.name || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button key={color.hex} onClick={() => setSelectedColor(color.hex)} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${selectedColor === color.hex ? 'ring-4 ring-offset-2 ring-primary-500' : 'border-border'}`} style={{ backgroundColor: color.hex }} title={color.name} />
            ))}
          </div>
        </div>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-foreground mb-3">Size: <span className="font-normal text-muted-foreground">{selectedSize || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-1 rounded-sm border-2 font-medium transition-all duration-200 ${selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'}`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-border text-muted-foreground text-sm">
        <p><span className="font-semibold text-foreground">Shop:</span> {product.shop?.name || 'N/A'}</p>
        <p><span className="font-semibold text-foreground">Availability:</span> {inStock ? <span className="text-green-500 font-medium">In Stock ({product.stock} left)</span> : <span className="text-red-500 font-medium">Out of Stock</span>}</p>
      </div>
    </div>
  );
}