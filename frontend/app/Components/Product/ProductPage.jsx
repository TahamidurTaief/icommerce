import React from "react";
import Sidebar from "./Sidebar";

const ProductPage = () => {
  return (
    <div className="w-[90%] mx-auto p-4">
      <div className="flex-row hidden lg:flex justify-between gap-5">
        <div className="max-w-[300px] w-full">
          <Sidebar />
        </div>
        <div className="w-full">{/* Add product details here */}</div>
      </div>
    </div>
  );
};

export default ProductPage;
