import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { HiOutlineEye } from "react-icons/hi2";
import { useState } from "react";
import { toast } from "react-toastify";

const ProductCard = ({ productData }) => {
  const colors = productData?.colors || [];
  const sizes = Array.isArray(productData?.sizes)
    ? productData.sizes
    : typeof productData?.sizes === "string"
    ? productData.sizes.split(" ")
    : [];
  const originalPrice = productData?.originalPrice || productData?.price || 0;
  const price = productData?.price || 0;
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.hex || null);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);

  // Generate proper product URL
  const productUrl = `/products/${productData.slug}`;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!productData.inStock) {
      toast.error("This product is out of stock", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    toast.success(`${productData.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
    // Add to cart logic here
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishlisted(!isWishlisted);
    toast.info(
      !isWishlisted
        ? `${productData.name} added to wishlist!`
        : `${productData.name} removed from wishlist!`,
      {
        position: "bottom-right",
        autoClose: 2000,
      }
    );
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setQuickViewOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <Link href={productUrl} passHref>
      <div className="group relative bg-white dark:bg-gray-800 p-2 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -{discount}%
          </span>
        )}

        {/* Stock Status Badge */}
        {!productData.inStock && (
          <span className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            Out of Stock
          </span>
        )}

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl">
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
              onClick={handleQuickView}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110"
              aria-label="Quick view"
            >
              <HiOutlineEye className="text-gray-700 text-lg" />
            </button>
            <button
              onClick={handleAddToWishlist}
              className={`p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
              aria-label="Add to wishlist"
            >
              <LuHeart className="text-lg" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!productData.inStock}
              className={`p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                productData.inStock
                  ? "bg-white hover:bg-gray-100"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label="Add to cart"
            >
              <LuShoppingCart className="text-lg" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-1">
          <span className="text-xs lato text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {productData.category}
          </span>
          <h3 className="font-medium lato truncate text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 hover:text-sky-500 transition-colors">
            {productData.name}
          </h3>

          {/* Rating */}
          {productData.rating && (
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(productData.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">
                ({productData.reviewCount || 0})
              </span>
            </div>
          )}

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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(color.hex);
                  }}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selectedColor === color.hex
                      ? "ring-2 ring-offset-1"
                      : "border-gray-200 dark:border-gray-600 hover:ring-2 hover:ring-offset-1"
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    "--tw-ring-color": color.hex,
                  }}
                  aria-label={color.name}
                  title={color.name}
                />
              ))}
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`px-2 py-1 text-xs rounded border ${
                    selectedSize === size
                      ? "bg-sky-500 text-white border-sky-500"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick View Modal */}
        {quickViewOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeQuickView}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                aria-label="Close quick view"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">{productData.name}</h3>
              <div className="relative aspect-square mb-4">
                <Image
                  src={productData.imageUrl}
                  alt={productData.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                {productData.description}
              </p>

              {/* Color and Size Selection */}
              {colors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Color:</h4>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedColor(color.hex);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color.hex
                            ? "ring-2 ring-offset-1"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                        style={{
                          backgroundColor: color.hex,
                          "--tw-ring-color": color.hex,
                        }}
                        aria-label={color.name}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Size:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSize(size);
                        }}
                        className={`px-3 py-1 text-sm rounded border ${
                          selectedSize === size
                            ? "bg-sky-500 text-white border-sky-500"
                            : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(e);
                }}
                disabled={!productData.inStock}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  productData.inStock
                    ? "bg-sky-500 hover:bg-sky-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {productData.inStock
                  ? `Add to Cart - $${price.toFixed(2)}`
                  : "Out of Stock"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
