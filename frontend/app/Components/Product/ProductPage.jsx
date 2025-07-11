"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ProductsData } from "@/app/lib/Data/ProductsData";
import ProductCard from "../Common/ProductCard";
import { FiFilter, FiX } from "react-icons/fi";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

// Motion variants defined directly in the component file
const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

const fadeIn = (direction, type = "tween", delay = 0, duration = 0.5) => ({
  hidden: {
    x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
    y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease: "easeOut",
    },
  },
});

const ProductPage = () => {
  const { resolvedTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [filteredProducts, setFilteredProducts] = useState(ProductsData);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 1000],
    sort: "featured",
    colors: [],
    brands: [],
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => setMounted(true), []);

  const applyFilters = useCallback(() => {
    let result = [...ProductsData];

    if (filters.category) {
      result = result.filter(
        (product) => product.category === filters.category
      );
    }

    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    if (filters.colors.length > 0) {
      result = result.filter((product) =>
        product.colors?.some((color) => filters.colors.includes(color.name))
      );
    }

    if (filters.brands.length > 0) {
      result = result.filter((product) =>
        filters.brands.includes(product.brand)
      );
    }

    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setFilteredProducts(result);
  }, [filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, 1000],
      sort: "featured",
      colors: [],
      brands: [],
    });
  };

  const handleModalClose = () => {
    setIsAnimating(false);
    setTimeout(() => setShowMobileFilters(false), 300);
  };

  const mobileBtnClass = useMemo(
    () =>
      `md:hidden flex items-center gap-2 mb-4 px-4 py-2 rounded-lg ${
        resolvedTheme === "dark"
          ? "bg-gray-700 text-white"
          : "bg-primary text-white"
      }`,
    [resolvedTheme]
  );

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer()}
      className="w-[90%] mx-auto px-4 py-8"
    >
      {/* Mobile Filter Button */}
      <motion.button
        variants={fadeIn("up", "tween", 0.2, 1)}
        onClick={() => {
          setIsAnimating(true);
          setShowMobileFilters(true);
        }}
        className={mobileBtnClass}
        aria-label="Open Filters"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FiFilter /> Filters
      </motion.button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar */}
        <motion.div
          variants={fadeIn("right", "tween", 0.2, 1)}
          className="hidden md:block w-72 flex-shrink-0"
        >
          <Sidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            theme={currentTheme}
          />
        </motion.div>

        {/* Mobile Filters Modal */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isAnimating ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-end md:hidden"
              style={{
                backgroundColor: isAnimating
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(0, 0, 0, 0)",
              }}
              onClick={handleModalClose}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: isAnimating ? 0 : "100%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className={`w-full ${
                  currentTheme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-t-2xl shadow-xl`}
                style={{
                  maxHeight: "70vh",
                  paddingBottom: "env(safe-area-inset-bottom, 20px)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`sticky top-0 z-10 ${
                    currentTheme === "dark" ? "bg-gray-800" : "bg-white"
                  } border-b ${
                    currentTheme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  } px-6 py-4 flex justify-between items-center rounded-t-2xl`}
                >
                  <h3
                    className={`text-lg font-bold ${
                      currentTheme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Filters
                  </h3>
                  <motion.button
                    onClick={handleModalClose}
                    className={`p-1 ${
                      currentTheme === "dark"
                        ? "text-gray-300"
                        : "text-gray-500"
                    } hover:text-gray-700 dark:hover:text-gray-200`}
                    aria-label="Close Filter"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>

                <div
                  className="overflow-y-auto p-6"
                  style={{ maxHeight: "calc(70vh - 72px)" }}
                >
                  <Sidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    theme={currentTheme}
                  />
                  <motion.button
                    onClick={handleModalClose}
                    className={`w-full mt-4 py-3 rounded-lg font-medium ${
                      currentTheme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-primary hover:bg-primary-dark text-white"
                    } transition-colors`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <motion.div
          variants={fadeIn("left", "tween", 0.2, 1)}
          className="flex-1"
        >
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.sku || index}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.5,
                  }}
                >
                  <ProductCard productData={product} />
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`col-span-full text-center py-10 ${
                  currentTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No products match your filters
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductPage;
