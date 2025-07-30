// app/Components/Product/ProductDetailPageClient.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import PaymentDetails from "./PaymentDetails";
import ProductTabs from "./ProductTabs";

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-green-500 mb-4">Success!</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Product added to your cart.</p>
        <button onClick={onClose} className="bg-primary text-white px-6 py-2 rounded-lg">Continue Shopping</button>
      </div>
    </div>
  );
};

export default function ProductDetailPageClient({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.hex || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    setSelectedColor(product.colors?.[0]?.hex || null);
    setSelectedSize(product.sizes?.[0] || null);
    setQuantity(1);
  }, [product]);

  const handleAddToCart = () => {
    if (!product.stock || product.stock < 1) {
      toast.error("This product is out of stock");
      return;
    }
    setSuccessModalOpen(true);
  };

  const allImages = [product.thumbnail_url, ...(product.additional_images?.map(img => img.image) || [])].filter(Boolean);

  const calculations = useMemo(() => {
    const price = parseFloat(product.discount_price) || parseFloat(product.price) || 0;
    const total = price * quantity;
    return { productPrice: price, total, quantity };
  }, [quantity, product.price, product.discount_price]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4"><ImageGallery images={allImages} productName={product.name} /></div>
        <div className="lg:col-span-4"><ProductInfo product={product} selectedColor={selectedColor} setSelectedColor={setSelectedColor} selectedSize={selectedSize} setSelectedSize={setSelectedSize} /></div>
        <div className="lg:col-span-4 "><PaymentDetails product={product} quantity={quantity} setQuantity={setQuantity} calculations={calculations} handleAddToCart={handleAddToCart} /></div>
        <div className="lg:col-span-8"><ProductTabs product={product} /></div>
      </div>
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} />
    </>
  );
}

