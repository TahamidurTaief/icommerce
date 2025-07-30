"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "../Common/ProductCard";
import Pagination from "../Common/Pagination"; // Import the new Pagination component
import { FiFilter, FiX } from "react-icons/fi";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "@/app/lib/api";

// Animation variants (unchanged)
const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({ hidden: {}, show: { transition: { staggerChildren, delayChildren } } });
const fadeIn = (direction, type = "tween", delay = 0, duration = 0.5) => ({ hidden: { x: direction === "left" ? 100 : direction === "right" ? -100 : 0, y: direction === "up" ? 50 : direction === "down" ? -50 : 0, opacity: 0 }, show: { x: 0, y: 0, opacity: 1, transition: { type, delay, duration, ease: "easeOut" } } });

const ProductPage = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for product data and loading status
  const [productData, setProductData] = useState({ results: [], count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Centralized state for all filters, initialized from URL parameters
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: [0, 1000],
    sort: searchParams.get("sort") || "featured",
    brands: searchParams.get("brands")?.split(',') || [],
    colors: searchParams.get("colors")?.split(',') || [],
  });
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const totalPages = Math.ceil(productData.count / 10); // Assuming 10 items/page from backend

  // Function to sync the URL with the current filter and page state
  const updateURL = useCallback((newFilters, newPage) => {
      const params = new URLSearchParams();
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','));
      if (newFilters.colors.length > 0) params.set('colors', newFilters.colors.join(','));
      if (newFilters.sort !== 'featured') params.set('sort', newFilters.sort);
      if (newPage > 1) params.set('page', newPage);
      // Use replace to avoid polluting browser history on every filter change
      router.replace(`/products?${params.toString()}`);
  }, [router]);

  // Effect to fetch products whenever filters or the current page change
  useEffect(() => {
    setIsLoading(true);
    getProducts(filters, currentPage).then(data => {
      if (data && !data.error) {
        setProductData(data);
      } else {
        setProductData({ results: [], count: 0 }); // Reset on error
      }
      setIsLoading(false);
    });
    updateURL(filters, currentPage);
  }, [filters, currentPage, updateURL]);

  // Callback for when filters are changed in the Sidebar
  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters(prev => ({ ...prev, ...newFilterValues }));
    setCurrentPage(1); // Reset to the first page whenever filters change
  }, []);

  // Callback to clear all filters
  const clearFilters = useCallback(() => {
    setFilters({ category: "", priceRange: [0, 1000], sort: "featured", brands: [], colors: [] });
    setCurrentPage(1);
    router.push('/products');
  }, [router]);

  // Callback for the Pagination component
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const mobileBtnClass = useMemo(() => `md:hidden flex items-center gap-2 mb-4 px-4 py-2 rounded-lg ${resolvedTheme === "dark" ? "bg-gray-700 text-white" : "bg-primary text-white"}`, [resolvedTheme]);

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer()} className="w-[90%] mx-auto px-4 py-8">
      <motion.button variants={fadeIn("up", "tween", 0.2, 1)} onClick={() => setShowMobileFilters(true)} className={mobileBtnClass} aria-label="Open Filters">
        <FiFilter /> Filters
      </motion.button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar */}
        <motion.div variants={fadeIn("right", "tween", 0.2, 1)} className="hidden md:block w-72 flex-shrink-0">
          <Sidebar filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} theme={resolvedTheme} />
        </motion.div>

        {/* Mobile Filter Panel (unchanged) */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:hidden bg-black/50" onClick={() => setShowMobileFilters(false)}>
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className={`w-full bg-[var(--color-surface)] rounded-t-2xl shadow-xl max-h-[70vh]`} onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="p-1 text-[var(--color-text-secondary)]"><FiX size={24} /></button>
                </div>
                <div className="overflow-y-auto p-6 max-h-[calc(70vh-72px)]">
                  <Sidebar filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} theme={resolvedTheme} />
                  <button onClick={() => setShowMobileFilters(false)} className="w-full mt-4 py-3 rounded-lg font-medium bg-primary text-white">Apply Filters</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid and Pagination */}
        <motion.div variants={fadeIn("left", "tween", 0.2, 1)} className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse"><div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-64 w-full"></div></div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {productData.results.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {productData.results.map((product) => (
                    <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                      <ProductCard productData={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-10 text-[var(--color-text-secondary)]">
                  No products match your filters.
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {/* Render the Pagination component */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductPage;
