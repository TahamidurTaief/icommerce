import ProductCard from "@/app/Components/Common/ProductCard";
import React from "react";

const FilteredProduct = ({ productData }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {" "}
      {/* Add horizontal padding */}
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {productData.map((product) => (
            <ProductCard key={product.sku} productData={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilteredProduct;
