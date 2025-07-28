"use client";
import React, { useState, useEffect, useCallback } from "react";
import FilterSection from "./FilterSection";
import FilteredProduct from "./FilteredProduct";

const FilterProducts = ({ products, categories }) => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: { min: 0, max: 1000 },
    sort: "",
  });

  const applyFilters = useCallback(() => {
    let result = [...products];

    // ক্যাটেগরি ফিল্টার (slug অনুযায়ী)
    if (filters.category) {
      result = result.filter(
        (product) => product.sub_category?.category?.slug === filters.category
      );
    }

    // প্রাইস রেঞ্জ ফিল্টার
    result = result.filter(
      (product) =>
        parseFloat(product.price) >= filters.priceRange.min &&
        parseFloat(product.price) <= filters.priceRange.max
    );

    // সর্টিং
    if (filters.sort) {
      switch (filters.sort) {
        case "price-asc":
          result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case "price-desc":
          result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case "name-asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }

    setFilteredProducts(result);
  }, [filters, products]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // মূল products prop পরিবর্তন হলে filteredProducts আপডেট হবে
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="py-10 md:py-16">
      {/* categories prop টি FilterSection এ পাস করা হচ্ছে */}
      <FilterSection categories={categories} onFilterChange={handleFilterChange} />
      <FilteredProduct productData={filteredProducts} />
    </div>
  );
};

export default FilterProducts;
