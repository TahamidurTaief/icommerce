"use client";

import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { HiOutlineEye } from "react-icons/hi2";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/app/contexts/ModalContext";

const ProductCard = ({ productData }) => {
  const { showModal } = useModal();
  
  // API থেকে আসা ডেটা অনুযায়ী ভেরিয়েবল সেট করুন
  const colors = productData?.specifications?.filter(spec => spec.name.toLowerCase() === 'color') || [];
  const sizes = productData?.specifications?.filter(spec => spec.name.toLowerCase() === 'size').map(s => s.value) || [];

  // ## BUG FIX START ##
  // Django থেকে আসা প্রাইস স্ট্রিংকে নাম্বারে রূপান্তর করা হয়েছে
  const originalPrice = parseFloat(productData?.price || 0);
  const price = parseFloat(productData?.discount_price || productData?.price || 0);
  // ## BUG FIX END ##

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  
  const inStock = productData?.stock > 0;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors?.[0]?.value || null);
  const [selectedSize, setSelectedSize] = useState(sizes?.[0] || null);
  const [selectedImage, setSelectedImage] = useState(productData?.thumbnail_url); 
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const productUrl = `/products/${productData?.slug}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      showModal({
        status: 'warning',
        title: 'Out of Stock',
        message: 'Sorry, this product is currently unavailable.',
        primaryActionText: 'Got it',
      });
      return;
    }

    const itemToAdd = {
      id: `${productData.slug}-${selectedColor || "default"}-${
        selectedSize || "default"
      }`,
      slug: productData.slug,
      name: productData.name,
      price: price,
      imageUrl: productData.thumbnail_url,
      quantity: 1,
      selectedColor: selectedColor,
      selectedSize: selectedSize,
    };

    const existingCartItems = JSON.parse(
      localStorage.getItem("cartItems") || "[]"
    );
    const existingItemIndex = existingCartItems.findIndex(
      (item) => item.id === itemToAdd.id
    );

    if (existingItemIndex > -1) {
      existingCartItems[existingItemIndex].quantity += 1;
    } else {
      existingCartItems.push(itemToAdd);
    }
    localStorage.setItem("cartItems", JSON.stringify(existingCartItems));

    showModal({
        status: 'success',
        title: 'Success!',
        message: 'Your item has been successfully added to the cart.',
        primaryActionText: 'Go to Cart',
        onPrimaryAction: () => {
            window.location.href = '/cart';
        },
        secondaryActionText: 'Continue Shopping'
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
      { position: "bottom-right", autoClose: 2000 }
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
          // style={{
          //   rotateX: `${rotation.x}deg`,
          //   rotateY: `${rotation.y}deg`,
          //   perspective: "600px",
          // }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
              -{discount}%
            </span>
          )}

          {!inStock && (
            <span className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
              Out of Stock
            </span>
          )}

          <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
            <Image
              src={productData?.thumbnail_url || '/img/default-product.jpg'}
              alt={productData?.name || 'Product Image'}
              fill
              className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={false}
              onError={(e) => { e.target.onerror = null; e.target.src='/img/default-product.jpg'; }}
            />

            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-xs">
              <motion.button
                onClick={handleQuickView}
                className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition-all duration-200"
                aria-label="Quick view"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <HiOutlineEye className="text-gray-800 text-lg" />
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
                <motion.div
                  key={isWishlisted ? "filled" : "empty"}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <LuHeart className={`text-lg ${isWishlisted ? 'text-white fill-current' : 'text-gray-800'}`} />
                </motion.div>
              </motion.button>
              <motion.button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`p-2.5 rounded-full shadow-lg transition-all duration-200 ${
                  inStock
                    ? "bg-white/90 hover:bg-white"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                aria-label="Add to cart"
                whileHover={inStock ? { scale: 1.1 } : {}}
                whileTap={inStock ? { scale: 0.9 } : {}}
              >
                <LuShoppingCart className="text-lg text-gray-800" />
              </motion.button>
            </div>
          </div>

          <div className="flex-grow">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {productData?.sub_category?.name}
            </span>
            <h3 className="font-medium text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {productData?.name}
            </h3>

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
          </div>
        </motion.div>
      </Link>

      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeQuickView}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeQuickView}
                className="absolute top-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg z-10 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close quick view"
              >
                <FiX className="text-lg" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div>
                  <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={selectedImage || '/img/default-product.jpg'}
                      alt={productData?.name || 'Product Image'}
                      fill
                      className="object-cover rounded-xl"
                      priority
                       onError={(e) => { e.target.onerror = null; e.target.src='/img/default-product.jpg'; }}
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                      productData?.thumbnail_url,
                      ...(productData?.additional_images?.map(img => img.image) || []),
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
                            ? "border-sky-500"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={img || '/img/default-product.jpg'}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                           onError={(e) => { e.target.onerror = null; e.target.src='/img/default-product.jpg'; }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {productData?.name}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                    {productData?.sub_category?.name}
                  </span>

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

                  {colors?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Color:
                      </h4>
                      <div className="flex gap-2">
                        {colors.map((color) => (
                          <motion.button
                            key={color?.value}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedColor(color.value);
                            }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              selectedColor === color.value
                                ? "ring-2 ring-offset-1 ring-gray-400"
                                : "border-gray-200 dark:border-gray-600"
                            }`}
                            style={{
                              backgroundColor: color.value.toLowerCase(),
                            }}
                            aria-label={color?.value}
                            title={color?.value}
                          />
                        ))}
                      </div>
                    </div>
                  )}

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
                                ? "bg-sky-600 text-white border-sky-600"
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
                      disabled={!inStock}
                      whileTap={inStock ? { scale: 0.98 } : {}}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                        inStock
                          ? "bg-sky-600 hover:bg-sky-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {inStock ? "Add to Cart" : "Out of Stock"}
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

