"use client";

import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { HiOutlineEye } from "react-icons/hi2";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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
  const [selectedColor, setSelectedColor] = useState(colors?.[0]?.hex || null);
  const [selectedSize, setSelectedSize] = useState(sizes?.[0] || null);
  const [selectedImage, setSelectedImage] = useState(productData?.imageUrl);
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Generate proper product URL
  const productUrl = `/products/${productData?.slug}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productData?.inStock) {
      toast.error("This product is out of stock", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    toast.success(`${productData?.name} added to cart!`, {
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
        ? `${productData?.name} added to wishlist!`
        : `${productData?.name} removed from wishlist!`,
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

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = mouseY / 20;
      const rotateY = -mouseX / 20;

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    hover: {},
  };

  // Animation variants for the modal
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: { opacity: 0, y: 30, scale: 0.98 },
  };

  return (
    <>
      <Link href={productUrl} passHref>
        <motion.div
          ref={cardRef}
          className="group relative bg-white dark:bg-gray-800 p-3 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer h-full flex flex-col justify-between"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover={{
            scale: 1.03,
            transition: { type: "spring", stiffness: 300 },
          }}
          style={{
            rotateX: `${rotation.x}deg`,
            rotateY: `${rotation.y}deg`,
            perspective: "600px",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
              -{discount}%
            </span>
          )}

          {/* Stock Status Badge */}
          {!productData?.inStock && (
            <span className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
              Out of Stock
            </span>
          )}

          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
            <Image
              src={productData?.imageUrl}
              alt={productData?.name}
              fill
              className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={false}
            />

            {/* Quick Actions - Only visible on hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-xs">
              <motion.button
                onClick={handleQuickView}
                className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition-all duration-200"
                aria-label="Quick view"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <HiOutlineEye className="text-gray-700 text-lg" />
              </motion.button>
              <motion.button
                onClick={handleAddToWishlist}
                className={`p-2.5 rounded-full shadow-lg transition-all duration-200 ${
                  isWishlisted
                    ? "bg-red-500/90 text-white"
                    : "bg-white/90 hover:bg-white"
                }`}
                aria-label="Add to wishlist"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Animate the heart icon on toggle */}
                <motion.div
                  key={isWishlisted ? "filled" : "empty"}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <LuHeart className="text-lg" />
                </motion.div>
              </motion.button>
              <motion.button
                onClick={handleAddToCart}
                disabled={!productData?.inStock}
                className={`p-2.5 rounded-full shadow-lg transition-all duration-200 ${
                  productData?.inStock
                    ? "bg-white/90 hover:bg-white"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                aria-label="Add to cart"
                whileHover={productData?.inStock ? { scale: 1.1 } : {}}
                whileTap={productData?.inStock ? { scale: 0.9 } : {}}
              >
                <LuShoppingCart className="text-lg" />
              </motion.button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-grow">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {productData?.category}
            </span>
            <h3 className="font-medium text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {productData?.name}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${price?.toFixed(2)}
              </span>
              {originalPrice > price && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${originalPrice?.toFixed(2)}
                </span>
              )}
            </div>

            {/* Colors */}
            {colors?.length > 0 && (
              <div className="flex gap-2 mt-3">
                {colors.map((color) => (
                  <motion.button
                    key={color?.name}
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
                    aria-label={color?.name}
                    title={color?.name}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            )}

            {/* Sizes */}
            {sizes?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {sizes.map((size) => (
                  <motion.button
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
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </Link>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeQuickView} // Close when clicking the backdrop
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
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
                      alt={productData?.name}
                      fill
                      className="object-cover rounded-xl"
                      priority
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                      productData?.imageUrl,
                      ...(productData?.additionalImages || []),
                    ].map((img, idx) => (
                      <motion.button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedImage(img);
                        }}
                        whileTap={{ scale: 0.95 }}
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
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {productData?.name}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                    {productData?.category}
                  </span>

                  {/* Rating (Uncomment if data is available) */}
                  {/* {productData.rating && (
                   <div className="flex items-center my-3">
                     ... Rating Stars ...
                   </div>
                 )} */}

                  {/* Price */}
                  <div className="mb-4 mt-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${price?.toFixed(2)}
                    </span>
                    {originalPrice > price && (
                      <span className="text-base text-gray-500 dark:text-gray-400 line-through ml-2">
                        ${originalPrice?.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {productData?.description}
                  </p>

                  {/* Colors */}
                  {colors?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Color:
                      </h4>
                      <div className="flex gap-2">
                        {colors.map((color) => (
                          <motion.button
                            key={color?.name}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedColor(color.hex);
                            }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              selectedColor === color.hex
                                ? "ring-2 ring-offset-1 ring-gray-400"
                                : "border-gray-200 dark:border-gray-600"
                            }`}
                            style={{
                              backgroundColor: color.hex,
                            }}
                            aria-label={color?.name}
                            title={color?.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {sizes?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Size:
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {sizes.map((size) => (
                          <motion.button
                            key={size}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSize(size);
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-1.5 text-sm rounded-md border ${
                              selectedSize === size
                                ? "bg-primary-600 text-white border-primary-600"
                                : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(e);
                        closeQuickView();
                      }}
                      disabled={!productData?.inStock}
                      whileTap={productData?.inStock ? { scale: 0.98 } : {}}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                        productData?.inStock
                          ? "bg-primary-600 hover:bg-primary-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {productData?.inStock ? "Add to Cart" : "Out of Stock"}
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToWishlist(e);
                      }}
                      whileTap={{ scale: 0.9 }}
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
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
