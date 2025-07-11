import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { HiOutlineEye } from "react-icons/hi2";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";

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
  const [selectedImage, setSelectedImage] = useState(productData.imageUrl);

  // Generate proper product URL
  const productUrl = `/products/${productData.slug}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

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
      <div className="group relative bg-white dark:bg-gray-800 p-3 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer h-full flex flex-col justify-between">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
            -{discount}%
          </span>
        )}

        {/* Stock Status Badge */}
        {!productData.inStock && (
          <span className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
            Out of Stock
          </span>
        )}

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
          <Image
            src={productData.imageUrl}
            alt={productData.name}
            fill
            className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
          />

          {/* Quick Actions - Only visible on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-xs">
            <button
              onClick={handleQuickView}
              className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
              aria-label="Quick view"
            >
              <HiOutlineEye className="text-gray-700 text-lg" />
            </button>
            <button
              onClick={handleAddToWishlist}
              className={`p-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                isWishlisted
                  ? "bg-red-500/90 text-white"
                  : "bg-white/90 hover:bg-white"
              }`}
              aria-label="Add to wishlist"
            >
              <LuHeart className="text-lg" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!productData.inStock}
              className={`p-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                productData.inStock
                  ? "bg-white/90 hover:bg-white"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label="Add to cart"
            >
              <LuShoppingCart className="text-lg" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-grow">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {productData.category}
          </span>
          <h3 className="font-medium text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {productData.name}
          </h3>

          {/* Rating */}
          {/* {productData.rating && (
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400 mr-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(productData.rating)
                        ? "fill-current"
                        : "stroke-current text-gray-300"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({productData.reviews || 0})
              </span>
            </div>
          )} */}

          {/* Price */}
          <div className="flex items-center gap-2 mt-auto">
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
                      ? "ring-2 ring-offset-1 ring-gray-400"
                      : "border-gray-200 dark:border-gray-600 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                  }`}
                  style={{
                    backgroundColor: color.hex,
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
                  className={`px-2.5 py-1 text-xs rounded-md border ${
                    selectedSize === size
                      ? "bg-primary-600 text-white border-primary-600"
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
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <button
                onClick={closeQuickView}
                className="absolute top-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg z-10 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close quick view"
              >
                <FiX className="text-lg" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Product Images */}
                <div>
                  <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={selectedImage}
                      alt={productData.name}
                      fill
                      className="object-cover rounded-xl"
                      priority
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                      productData.imageUrl,
                      ...(productData.additionalImages || []),
                    ].map((img, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedImage(img);
                        }}
                        className={`relative h-16 w-16 min-w-[4rem] rounded-md overflow-hidden border-2 transition-all ${
                          selectedImage === img
                            ? "border-primary-600"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {productData.name}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                    {productData.category}
                  </span>

                  {/* Rating */}
                  {productData.rating && (
                    <div className="flex items-center my-3">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(productData.rating)
                                ? "fill-current"
                                : "stroke-current text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({productData.reviews || 0} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${price.toFixed(2)}
                    </span>
                    {originalPrice > price && (
                      <span className="text-base text-gray-500 dark:text-gray-400 line-through ml-2">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {productData.description}
                  </p>

                  {/* Colors */}
                  {colors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Color:
                      </h4>
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
                                ? "ring-2 ring-offset-1 ring-gray-400"
                                : "border-gray-200 dark:border-gray-600"
                            }`}
                            style={{
                              backgroundColor: color.hex,
                            }}
                            aria-label={color.name}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {sizes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Size:
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSize(size);
                            }}
                            className={`px-3 py-1.5 text-sm rounded-md border ${
                              selectedSize === size
                                ? "bg-primary-600 text-white border-primary-600"
                                : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(e);
                        closeQuickView();
                      }}
                      disabled={!productData.inStock}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                        productData.inStock
                          ? "bg-primary-600 hover:bg-primary-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {productData.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToWishlist(e);
                      }}
                      className={`p-3 rounded-lg border flex items-center justify-center ${
                        isWishlisted
                          ? "border-red-500 text-red-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <LuHeart
                        className={`text-lg ${
                          isWishlisted ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
