// components/Product/ProductTabs.jsx
"use client";

import { useState } from "react";

// Simple Fade component for smooth transition animation
const Fade = ({ children, isActive }) => (
  <div
    className={`transition-opacity duration-500 ease-in-out ${
      isActive ? "opacity-100 block" : "opacity-0 hidden"
    }`}
  >
    {children}
  </div>
);

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", name: "Description" },
    { id: "specs", name: "Specification" },
    { id: "seller", name: "Shop Info" },
    { id: "review", name: "Reviews" },
  ];

  return (
    // UPDATED: mt-8 changed to mt-6 to reduce space on mobile. lg:mt-0 remains for desktop.
    <div className="bg-[var(--color-second-bg)] rounded-lg p-6 shadow-md mt-6 lg:mt-0">
      <div className="flex gap-4 border-b border-border mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 text-lg font-semibold transition-colors duration-200 whitespace-nowrap relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.name}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-all duration-300" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        <Fade isActive={activeTab === "description"}>
          <p>{product.description}</p>
        </Fade>
        <Fade isActive={activeTab === "specs"}>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              Product Specifications
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>**Category:** {product.category}</li>
              <li>**Brand:** {product.brand}</li>
              <li>**SKU:** {product.sku}</li>
              <li>**Material:** Example Material</li>
            </ul>
          </div>
        </Fade>
        <Fade isActive={activeTab === "seller"}>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              Seller Information
            </h3>
            <p>Shop Name: Issl Commerce Official Store</p>
            <p>Location: Dhaka, Bangladesh</p>
          </div>
        </Fade>
        <Fade isActive={activeTab === "review"}>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              Customer Reviews ({product.reviews})
            </h3>
            {product.reviews > 0 ? (
              <p>Average Rating: {product.rating}/5.</p>
            ) : (
              <p>No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </Fade>
      </div>
    </div>
  );
}
