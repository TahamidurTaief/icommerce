// HomePage.jsx
import React from "react";
import Hero from "./Hero";
import CategoryCards from "./CategoryCards";
import FilterProducts from "./FilterProducts/FilterProducts";
import Review from "./Review";
import BlogSection from "./BlogSection";

const HomePage = () => {
  return (
    <div className="w-full">
      <Hero />
      <CategoryCards />
      <FilterProducts />
      <Review />
      <BlogSection />
    </div>
  );
};

export default HomePage;
