"use client";
import React, { useState, useCallback, useEffect } from "react";
import { VscSettings, VscChromeClose } from "react-icons/vsc";
import Link from "next/link";

const ChevronDownIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const FilterSection = ({ categories = [], onFilterChange }) => {
  const MAX_PRICE = 1000;
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // This effect calls the parent's onFilterChange function whenever a filter state changes.
  useEffect(() => {
    const filters = {
      category: selectedCategory,
      priceRange: { min: minPrice, max: maxPrice },
      sort: sortOrder,
    };
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [selectedCategory, minPrice, maxPrice, sortOrder, onFilterChange]);

  const handleMinPriceChange = useCallback((e) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1);
    setMinPrice(value);
  }, [maxPrice]);

  const handleMaxPriceChange = useCallback((e) => {
    const value = Math.max(Number(e.target.value), minPrice + 1);
    setMaxPrice(value);
  }, [minPrice]);

  const minPos = (minPrice / MAX_PRICE) * 100;
  const maxPos = (maxPrice / MAX_PRICE) * 100;

  const toggleModal = useCallback(() => {
    if (!isModalOpen) {
      setIsModalOpen(true);
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setIsModalOpen(false);
        document.body.style.overflow = "";
      }, 300);
    }
  }, [isModalOpen]);

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleModal();
    }
  };

  const applyFilters = () => {
    toggleModal();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        toggleModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, toggleModal]);

  return (
    <>
      <section className="container mx-auto pt-8 md:pb-4">
        <div className="flex bg-white dark:bg-gray-950 shadow-md py-4 px-5 rounded-lg flex-row md:flex-row justify-between items-start md:items-center align-center gap-6 mb-8">
          <div className="w-full">
            <h2 className="text-xl md:text-xl lg:text-3xl xl:text-4xl font-bold text-[var(--color-text-primary)] w-full">
              Explore <span className="text-sky-500">Products</span>
            </h2>
          </div>
          <div className="justify-end flex md:hidden">
            <button
              onClick={toggleModal}
              className="p-1"
              aria-label="Open filters"
            >
              <VscSettings className="text-2xl text-[var(--color-text-primary)]" />
            </button>
          </div>
          <div className="w-full hidden md:flex">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <div className="relative h-12 bg-slate-50 dark:bg-slate-800 px-2 py-5 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center">
                  <div className="relative w-full h-1.5 mt-4 bg-slate-200 dark:bg-slate-600 rounded-full">
                    <div
                      className="absolute h-1.5 bg-sky-500 rounded-full"
                      style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                    />
                  </div>
                  <div className="absolute top-0 left-0 right-0 flex justify-between px-2 pt-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      ${minPrice}
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      ${maxPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={MAX_PRICE}
                    step="10"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    className="price-range-thumb mt-2"
                    aria-label="Minimum Price"
                  />
                  <input
                    type="range"
                    min="0"
                    max={MAX_PRICE}
                    step="10"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    className="price-range-thumb mt-2"
                    aria-label="Maximum Price"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
                <div className="relative">
                  <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  >
                    <option value="">Relevance</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                    <option value="-name">Name: Z-A</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-52">
            <Link
              href="/products"
              className="text-blue-500 lato hover:text-blue-400 duration-200 w-full text-md underline"
            >
              All Products
            </Link>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end transition-opacity duration-300"
          onClick={handleOutsideClick}
          style={{
            opacity: isAnimating ? 1 : 0,
            transition: "opacity 300ms ease-out",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className={`w-full bg-white dark:bg-gray-950 rounded-t-4xl shadow-xl transform transition-transform duration-300 ${
              isAnimating ? "translate-y-0" : "translate-y-full"
            }`}
            style={{
              maxHeight: "70vh",
              marginBottom: "40px",
              paddingBottom: "25px",
            }}
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                Filter Products
              </h3>
              <button
                onClick={toggleModal}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Close filters"
              >
                <VscChromeClose className="text-2xl" />
              </button>
            </div>

            <div
              className="overflow-y-auto p-6"
              style={{ maxHeight: "calc(70vh - 72px)" }}
            >
              <div className="flex flex-col gap-3 mb-6">
                <label
                  htmlFor="mobile-category-select"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300"
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    id="mobile-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mb-6">
                <div className="relative h-16 bg-slate-50 dark:bg-slate-800 px-2 py-5 mt-1 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center">
                  <div className="relative w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full">
                    <div
                      className="absolute h-1.5 bg-sky-500 rounded-full"
                      style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                    />
                  </div>
                  <div className="absolute top-0 left-0 right-0 flex justify-between px-2 pt-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      ${minPrice}
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      ${maxPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={MAX_PRICE}
                    step="10"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    className="price-range-thumb"
                    aria-label="Minimum Price"
                  />
                  <input
                    type="range"
                    min="0"
                    max={MAX_PRICE}
                    step="10"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    className="price-range-thumb"
                    aria-label="Maximum Price"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mb-8">
                <label
                  htmlFor="mobile-sort-order"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300"
                >
                  Sort By
                </label>
                <div className="relative">
                  <select
                    id="mobile-sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  >
                    <option value="">Relevance</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                    <option value="-name">Name: Z-A</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
              
              <button
                onClick={applyFilters}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSection;
