"use client";

import React, { useState, useRef, useEffect } from "react";
import AllCategoryComponents from "../Categories/AllCategoryComponents";
import { CategoriesData } from "@/app/lib/Data/CategoriesData";
import BrandData from "@/app/lib/Data/BrandData";
import Image from "next/image";

const Sidebar = () => {
  // Category states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const categoryRef = useRef(null);

  // Brand states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const brandRef = useRef(null);

  // Toggle category selection
  const handleCategorySelect = (categoryTitle) => {
    setSelectedCategory(
      categoryTitle === selectedCategory ? null : categoryTitle
    );
  };

  // Toggle brand selection
  const handleBrandSelect = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Toggle show all categories
  const toggleShowCategories = () => {
    setShowAllCategories(!showAllCategories);
  };

  // Toggle show all brands
  const toggleShowBrands = () => {
    setShowAllBrands(!showAllBrands);
  };

  // Display limited or all items
  const displayedCategories = showAllCategories
    ? CategoriesData
    : CategoriesData.slice(0, 5);

  const displayedBrands = showAllBrands ? BrandData : BrandData.slice(0, 5);

  return (
    <div className="w-full h-full bg-[var(--color-surface)] rounded-lg p-4 overflow-y-auto shadow-lg">
      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="raleway font-medium text-xl text-[var(--color-text-primary)] mb-4">
          Product Categories
        </h2>
        <div
          ref={categoryRef}
          className="space-y-3 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            height: showAllCategories
              ? `${categoryRef.current?.scrollHeight}px`
              : "192px",
          }}
        >
          {displayedCategories.map((data) => (
            <AllCategoryComponents
              key={data.id}
              id={data.id}
              icon={data.icon}
              title={data.title}
              isSelected={selectedCategory === data.title}
              onClick={() => handleCategorySelect(data.title)}
            />
          ))}
        </div>
        {CategoriesData.length > 5 && (
          <button
            onClick={toggleShowCategories}
            className="w-full mt-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-1"
          >
            {showAllCategories ? (
              <>
                <span>Show Less Categories</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </>
            ) : (
              <>
                <span>Show More Categories</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* Brands Section */}
      <div className="mb-8">
        <h2 className="raleway font-medium text-xl text-[var(--color-text-primary)] mb-4">
          Popular Brands
        </h2>
        <div
          ref={brandRef}
          className="space-y-4 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            height: showAllBrands
              ? `${brandRef.current?.scrollHeight}px`
              : "240px",
          }}
        >
          {displayedBrands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => handleBrandSelect(brand.id)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedBrands.includes(brand.id)
                  ? "bg-[var(--color-primary)] bg-opacity-10 border border-[var(--color-primary)]"
                  : "hover:bg-[var(--color-muted-bg)] hover:bg-opacity-30"
              }`}
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border)]">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[var(--color-text-primary)] truncate">
                  {brand.name}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {brand.description}
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedBrands.includes(brand.id)
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {selectedBrands.includes(brand.id) && (
                  <svg
                    className="w-2 h-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
        {BrandData.length > 5 && (
          <button
            onClick={toggleShowBrands}
            className="w-full mt-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-1"
          >
            {showAllBrands ? (
              <>
                <span>Show Less Brands</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </>
            ) : (
              <>
                <span>Show More Brands</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
