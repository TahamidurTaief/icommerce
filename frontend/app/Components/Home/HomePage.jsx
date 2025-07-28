// frontend/app/Components/Home/HomePage.jsx
import React from "react";
import Hero from "./Hero";
import CategoryCards from "./CategoryCards";
import FilterProducts from "./FilterProducts/FilterProducts";
import Review from "./Review";
import BlogSection from "./BlogSection";

const HomePage = ({ initialProducts, categories }) => {
  return (
    <div className="w-full">
      <Hero />
      <CategoryCards categories={categories} />
      <FilterProducts 
        initialProducts={initialProducts} 
        categories={categories} 
      />
      <Review />
      <BlogSection />
    </div>
  );
};

export default HomePage;
