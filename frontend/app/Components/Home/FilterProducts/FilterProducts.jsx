"use client";
import React, { useState, useEffect, useCallback } from "react";
import FilterSection from "./FilterSection";
import FilteredProduct from "./FilteredProduct";
import { getProducts } from "@/app/lib/api"; // Updated import

const FilterProducts = ({ initialProducts, categories }) => {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  
  // This state will hold the active filters
  const [filters, setFilters] = useState({
    category: "",
    priceRange: { min: 0, max: 10000 },
    sort: "",
  });

  // This function is called when any filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // useEffect to fetch products when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      
      const searchParams = {
        category: filters.category,
        min_price: filters.priceRange.min,
        max_price: filters.priceRange.max,
        ordering: filters.sort,
      };

      const newProductsData = await getProducts(searchParams);
      setProducts(newProductsData?.results || []);
      
      setIsLoading(false);
    };
    
    // We don't need to fetch on initial render if initialProducts exist
    if(filters.category || filters.priceRange.min > 0 || filters.priceRange.max < 1000 || filters.sort) {
        fetchFilteredProducts();
    } else {
        setProducts(initialProducts); // Reset to initial if filters are cleared
    }

  }, [filters, initialProducts]);

  return (
    <div className="py-10 md:py-16">
      <FilterSection categories={categories} onFilterChange={handleFilterChange} />
      <FilteredProduct productData={products} isLoading={isLoading} />
    </div>
  );
};

export default FilterProducts;
