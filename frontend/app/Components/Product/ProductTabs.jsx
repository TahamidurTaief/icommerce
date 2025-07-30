// ===================================================================
// app/Components/Product/ProductTabs.jsx

"use client";

import { useState } from "react";

const Fade = ({ children, isActive }) => (
  <div className={`transition-opacity duration-500 ease-in-out ${isActive ? "opacity-100" : "opacity-0 hidden"}`}>
    {children}
  </div>
);

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", name: "Description" },
    { id: "specs", name: "Specification" },
    { id: "seller", name: "Shop Info" },
    { id: "reviews", name: `Reviews (${product.review_count || 0})` },
  ];

  return (
    <div className="bg-[var(--color-second-bg)] rounded-lg p-6 shadow-md mt-6 lg:mt-0">
      <div className="flex gap-4 border-b border-border mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 px-4 text-lg font-semibold transition-colors duration-200 whitespace-nowrap relative ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {tab.name}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
        ))}
      </div>
      <div className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none">
        <Fade isActive={activeTab === "description"}>
          <div dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />
          {product.additional_descriptions?.map(desc => (
            <div key={desc.id} dangerouslySetInnerHTML={{ __html: desc.description }} className="mt-4"/>
          ))}
        </Fade>
        <Fade isActive={activeTab === "specs"}>
          <ul className="list-disc list-inside space-y-2">
            {product.specifications?.length > 0 ? product.specifications.map(spec => (
              <li key={spec.name}><strong>{spec.name}:</strong> {spec.value}</li>
            )) : <li>No specifications available.</li>}
          </ul>
        </Fade>
        <Fade isActive={activeTab === "seller"}>
            <h3 className="text-xl font-semibold mb-3 text-foreground">{product.shop?.name || 'Shop Information'}</h3>
            <p>{product.shop?.description || "No description available for this shop."}</p>
        </Fade>
        <Fade isActive={activeTab === "reviews"}>
            {product.reviews?.length > 0 ? (
                <div className="space-y-4">
                    {product.reviews.map(review => (
                        <div key={review.id} className="border-b border-border pb-4">
                            <p className="font-semibold">{review.user}</p>
                            <p className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                            <div className="flex text-yellow-400 my-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "stroke-current text-gray-300"}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                ))}
                            </div>
                            <p>{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No reviews yet. Be the first to review this product!</p>
            )}
        </Fade>
      </div>
    </div>
  );
}