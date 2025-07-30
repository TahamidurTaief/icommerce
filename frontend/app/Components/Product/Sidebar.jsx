"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { getCategories, getShops, getColors } from "@/app/lib/api";

const Sidebar = ({ filters, onFilterChange, onClearFilters, theme }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  // Fetch all data for filters when the component mounts
  useEffect(() => {
    const fetchSidebarData = async () => {
      const [categoriesData, shopsData, colorsData] = await Promise.all([
        getCategories(),
        getShops(), // "Brands" are fetched from the /api/shops/ endpoint
        getColors(),
      ]);
      if (categoriesData && Array.isArray(categoriesData)) setCategories(categoriesData);
      if (shopsData && Array.isArray(shopsData)) setBrands(shopsData);
      if (colorsData && Array.isArray(colorsData)) setColors(colorsData);
    };
    fetchSidebarData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
  };

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  const handleSortChange = (value) => onFilterChange({ sort: value });
  const handlePriceChange = (values) => onFilterChange({ priceRange: values });
  const handleCategoryChange = (slug) => onFilterChange({ category: filters.category === slug ? "" : slug });
  
  const handleBrandChange = (slug) => {
    const newBrands = filters.brands.includes(slug)
      ? filters.brands.filter((b) => b !== slug)
      : [...filters.brands, slug];
    onFilterChange({ brands: newBrands });
  };

  const handleColorChange = (name) => {
    const newColors = filters.colors.includes(name)
      ? filters.colors.filter((c) => c !== name)
      : [...filters.colors, name];
    onFilterChange({ colors: newColors });
  };

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5);
  const displayedBrands = showAllBrands ? brands : brands.slice(0, 5);
  const displayedColors = showAllColors ? colors : colors.slice(0, 6);

  return (
    <aside className={`sticky top-[109px] h-[calc(100vh-170px)] w-full md:w-72 rounded-xl shadow border flex flex-col ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className={`flex justify-between items-center px-4 py-3 border-b ${theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
        <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Filters</h2>
        <button onClick={onClearFilters} className={`text-sm flex items-center gap-1 ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}>
          <X size={14} /> Clear all
        </button>
      </div>

      <div className={`overflow-y-auto px-4 py-5 space-y-8 flex-1 ${theme === "dark" ? "custom-scrollbar-dark" : "custom-scrollbar"}`}>
        {/* Sort By Section */}
        <div className="space-y-3">
          <h3 className={`text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Sort By</h3>
          <div className="space-y-2 pl-2">
            {sortOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <button onClick={() => handleSortChange(option.value)} className={`w-4 h-4 rounded-full border flex items-center justify-center ${filters.sort === option.value ? `bg-blue-500 border-blue-500` : theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>
                  {filters.sort === option.value && <Check size={12} className="text-white" />}
                </button>
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="space-y-3">
          <h3 className={`text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Price Range</h3>
          <div className="pl-2 space-y-4">
            <Slider min={0} max={1000} step={10} value={filters.priceRange} onValueChange={handlePriceChange} className={`mb-2 ${theme === "dark" ? "[&>div]:bg-gray-600" : "[&>div]:bg-gray-200"}`}/>
            <div className={`flex justify-between text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-3">
            <h3 className={`text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Categories</h3>
          <div className="space-y-3 pl-2">
            {displayedCategories.map((cat) => (
              <div key={cat.id} onClick={() => handleCategoryChange(cat.slug)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${filters.category === cat.slug ? (theme === "dark" ? "bg-blue-900/30 border-blue-700" : "bg-blue-100 border-blue-500") : (theme === "dark" ? "hover:bg-gray-700 border-transparent" : "hover:bg-gray-100 border-transparent")}`}>
                {cat.image && <div className="relative w-8 h-8 rounded-md overflow-hidden"><Image src={cat.image} alt={cat.name} fill className="object-cover" /></div>}
                <span className={`flex-1 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>{cat.name}</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${filters.category === cat.slug ? "bg-blue-500 border-blue-500" : (theme === "dark" ? "border-gray-600" : "border-gray-300")}`}>{filters.category === cat.slug && <Check size={12} className="text-white" />}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="space-y-3">
            <h3 className={`text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Brands</h3>
          <div className="space-y-3 pl-2">
            {displayedBrands.map((brand) => (
              <div key={brand.id} onClick={() => handleBrandChange(brand.slug)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${filters.brands.includes(brand.slug) ? (theme === "dark" ? "bg-blue-900/30 border-blue-700" : "bg-blue-100 border-blue-500") : (theme === "dark" ? "hover:bg-gray-700 border-transparent" : "hover:bg-gray-100 border-transparent")}`}>
                <div className="flex-1 min-w-0"><h3 className={`font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>{brand.name}</h3></div>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${filters.brands.includes(brand.slug) ? "bg-blue-500 border-blue-500" : (theme === "dark" ? "border-gray-600" : "border-gray-300")}`}>{filters.brands.includes(brand.slug) && <Check size={12} className="text-white" />}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Colors Section */}
        <div className="space-y-3">
            <h3 className={`text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Colors</h3>
          <div className="pl-2">
            <div className="flex flex-wrap gap-2">
              {displayedColors.map((color) => (
                <button key={color.id} onClick={() => handleColorChange(color.name)} className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border ${filters.colors.includes(color.name) ? "ring-2 ring-offset-2 ring-blue-500" : (theme === "dark" ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400")}`} style={{ backgroundColor: color.hex }} title={color.name}>
                  {filters.colors.includes(color.name) && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Scrollbar styles remain unchanged */}
    </aside>
  );
};

export default Sidebar;
