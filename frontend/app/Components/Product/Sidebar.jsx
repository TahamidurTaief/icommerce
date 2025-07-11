"use client";
import React, { useState, useEffect } from "react";
import { CategoriesData } from "@/app/lib/Data/CategoriesData";
import { BrandData } from "@/app/lib/Data/BrandData";
import { ColorData } from "@/app/lib/Data/ColorData";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const Sidebar = ({ filters, onFilterChange, onClearFilters, theme }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  const handleSortChange = (value) => {
    onFilterChange({ sort: value });
  };

  const handlePriceChange = (values) => {
    onFilterChange({ priceRange: values });
  };

  const handleCategoryChange = (category) => {
    onFilterChange({ category: filters.category === category ? "" : category });
  };

  const handleBrandChange = (brand) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ brands: newBrands });
  };

  const handleColorChange = (color) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ colors: newColors });
  };

  // Display limited or all items
  const displayedCategories = showAllCategories
    ? CategoriesData
    : CategoriesData.slice(0, 5);
  const displayedBrands = showAllBrands ? BrandData : BrandData.slice(0, 5);
  const displayedColors = showAllColors ? ColorData : ColorData.slice(0, 6);

  return (
    <aside
      className={`sticky top-[109px] h-[calc(100vh-170px)] w-full md:w-72 rounded-xl shadow border flex flex-col ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`flex justify-between items-center px-4 py-3 border-b ${
          theme === "dark"
            ? "border-gray-700 bg-gray-900"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <h2
          className={`text-xl font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Filters
        </h2>
        <button
          onClick={onClearFilters}
          className={`text-sm flex items-center gap-1 ${
            theme === "dark"
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-600 hover:text-blue-800"
          }`}
        >
          <X size={14} /> Clear all
        </button>
      </div>

      <div
        className={`overflow-y-auto px-4 py-5 space-y-8 flex-1 ${
          theme === "dark" ? "custom-scrollbar-dark" : "custom-scrollbar"
        }`}
      >
        {/* Sort By */}
        <div className="space-y-3">
          <h3
            className={`text-lg font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            }`}
          >
            Sort By
          </h3>
          <div className="space-y-2 pl-2">
            {sortOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <button
                  onClick={() => handleSortChange(option.value)}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    filters.sort === option.value
                      ? `bg-blue-500 border-blue-500 ${
                          theme === "dark"
                            ? "!bg-blue-600 !border-blue-600"
                            : ""
                        }`
                      : theme === "dark"
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                >
                  {filters.sort === option.value && (
                    <Check size={12} className="text-white" />
                  )}
                </button>
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <h3
            className={`text-lg font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            }`}
          >
            Price Range
          </h3>
          <div className="pl-2 space-y-4">
            <div className="flex justify-between gap-4">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  handlePriceChange([
                    Number(e.target.value),
                    filters.priceRange[1],
                  ])
                }
                min="0"
                max="1000"
                className={`w-full p-2 border rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  handlePriceChange([
                    filters.priceRange[0],
                    Number(e.target.value),
                  ])
                }
                min="0"
                max="1000"
                className={`w-full p-2 border rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              className={`mb-2 ${
                theme === "dark" ? "[&>div]:bg-gray-600" : "[&>div]:bg-gray-200"
              }`}
            />
            <div
              className={`flex justify-between text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-800"
              }`}
            >
              Categories
            </h3>
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className={`text-sm ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
              {showAllCategories ? "Show Less" : "Show More"}
            </button>
          </div>
          <div className="space-y-3 pl-2">
            {displayedCategories.map((data) => (
              <div
                key={data.id}
                onClick={() => handleCategoryChange(data.title)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  filters.category === data.title
                    ? theme === "dark"
                      ? "bg-blue-900/30 border-blue-700"
                      : "bg-blue-100 border-blue-500"
                    : theme === "dark"
                    ? "hover:bg-gray-700 border-transparent"
                    : "hover:bg-gray-100 border-transparent"
                } border`}
              >
                <div className="relative w-8 h-8 rounded-md overflow-hidden">
                  <Image
                    src={data.icon}
                    alt={data.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <span
                  className={`flex-1 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {data.title}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    filters.category === data.title
                      ? "bg-blue-500 border-blue-500"
                      : theme === "dark"
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                >
                  {filters.category === data.title && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-800"
              }`}
            >
              Brands
            </h3>
            <button
              onClick={() => setShowAllBrands(!showAllBrands)}
              className={`text-sm ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
              {showAllBrands ? "Show Less" : "Show More"}
            </button>
          </div>
          <div className="space-y-3 pl-2">
            {displayedBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleBrandChange(brand.id)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  filters.brands.includes(brand.id)
                    ? theme === "dark"
                      ? "bg-blue-900/30 border-blue-700"
                      : "bg-blue-100 border-blue-500"
                    : theme === "dark"
                    ? "hover:bg-gray-700 border-transparent"
                    : "hover:bg-gray-100 border-transparent"
                } border`}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium truncate ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {brand.name}
                  </h3>
                  <p
                    className={`text-xs truncate ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {brand.description}
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    filters.brands.includes(brand.id)
                      ? "bg-blue-500 border-blue-500"
                      : theme === "dark"
                      ? "border-gray-600"
                      : "border-gray-300"
                  }`}
                >
                  {filters.brands.includes(brand.id) && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-800"
              }`}
            >
              Colors
            </h3>
            <button
              onClick={() => setShowAllColors(!showAllColors)}
              className={`text-sm ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              } hover:underline`}
            >
              {showAllColors ? "Show Less" : "Show More"}
            </button>
          </div>
          <div className="pl-2">
            <div className="flex flex-wrap gap-2">
              {displayedColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.name)}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    theme === "dark"
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                  } ${
                    filters.colors.includes(color.name)
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {filters.colors.includes(color.name) && (
                    <Check size={14} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;