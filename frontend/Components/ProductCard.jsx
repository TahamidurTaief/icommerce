import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { HiOutlineEye } from "react-icons/hi2";
import { IoBagCheckOutline } from "react-icons/io5";

const ProductCard = ({ productData }) => {
  const colors = productData?.colors || [];
  const sizes = productData?.sizes || "";
  const originalPrice = productData?.originalPrice || productData?.price || 0;
  const price = productData?.price || 0;
  const discount = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 p-2 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      {/* Discount Badge */}
      {discount > 0 && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          -{discount}%
        </span>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl ">
        <Image
          src={productData.imageUrl}
          alt={productData.name}
          fill
          className="object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Quick Actions - Only visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
          <button 
            className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            aria-label="Quick view"
          >
            <HiOutlineEye className="text-gray-700 text-lg" />
          </button>
          <button 
            className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            aria-label="Add to wishlist"
          >
            <LuHeart className="text-gray-700 text-lg" />
          </button>
          <button 
            className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            aria-label="Add to cart"
          >
            <LuShoppingCart className="text-gray-700 text-lg" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className=" mt-1">
        <span className="text-xs lato text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {productData.category}
        </span>
        <Link href={`/products/${productData.slug}`}>
          <h3 className="font-medium lato truncate text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 hover:text-sky-500 transition-colors">
            {productData.name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </span>
          {originalPrice > price && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex gap-2 mt-3">
            {colors.map((color) => (
              <button
                key={color.name}
                className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600 hover:ring-2 hover:ring-offset-1 transition-all"
                style={{ 
                  backgroundColor: color.hex,
                  '--tw-ring-color': color.hex 
                }}
                aria-label={color.name}
              />
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        {/* <button className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md">
          Add to Cart
        </button> */}
      </div>
    </div>
  );
};

export default ProductCard;