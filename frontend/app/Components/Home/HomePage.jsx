// frontend/app/Components/Home/HomePage.jsx

import React from "react";
import Hero from "./Hero";
import CategoryCards from "./CategoryCards";
import FilterProducts from "./FilterProducts/FilterProducts";
import Review from "./Review";
import BlogSection from "./BlogSection";

const HomePage = ({ products, categories }) => {
  return (
    <div className="w-full">
      <Hero />
      <CategoryCards categories={categories} />
      {/* categories prop টি FilterProducts এ পাস করা হচ্ছে */}
      <FilterProducts products={products} categories={categories} />
      <Review />
      <BlogSection />
    </div>
  );
};

export default HomePage;
