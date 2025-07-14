// components/Product/ProductDetailPageClient.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { CouponData } from "@/app/lib/Data/CouponData";
import { toast } from "react-toastify";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import PaymentDetails from "./PaymentDetails";
import ProductTabs from "./ProductTabs";
import SuccessModal from "../Common/SuccessModal"; // UPDATED: Import the new modal

export default function ProductDetailPageClient({ product }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false); // UPDATED: State for the modal

  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0)
        setSelectedColor(product.colors[0].hex);
      if (product.sizes && product.sizes.length > 0)
        setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const shippingRates = { air: 900, sea: 450 };
  const vatRate = 0.05;

  const calculations = useMemo(() => {
    const productPrice = product.price || 0;
    const currentShippingCost =
      selectedShipping === "air"
        ? shippingRates.air
        : selectedShipping === "sea"
        ? shippingRates.sea
        : 0;
    let subtotal = quantity * productPrice + currentShippingCost;
    let discountAmount = 0;
    if (appliedCoupon) {
      discountAmount = subtotal * (appliedCoupon.discount / 100);
      subtotal -= discountAmount;
    }
    const vat = subtotal * vatRate;
    const total = subtotal + vat;
    return {
      productPrice,
      shippingCost: currentShippingCost,
      discountAmount,
      vat,
      total,
    };
  }, [
    quantity,
    product,
    selectedShipping,
    appliedCoupon,
    shippingRates.air,
    shippingRates.sea,
  ]);

  // UPDATED: handleAddToCart now opens the modal
  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }
    const itemToAdd = {
      id: `${product.slug}-${selectedColor}-${selectedSize}`,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      selectedColor: selectedColor,
      selectedSize: selectedSize,
    };
    const existingCartItems = JSON.parse(
      localStorage.getItem("cartItems") || "[]"
    );
    const existingItemIndex = existingCartItems.findIndex(
      (item) => item.id === itemToAdd.id
    );

    if (existingItemIndex > -1) {
      existingCartItems[existingItemIndex].quantity += quantity;
    } else {
      existingCartItems.push(itemToAdd);
    }
    localStorage.setItem("cartItems", JSON.stringify(existingCartItems));

    // Open the success modal
    setSuccessModalOpen(true);
  };

  const allImages = [product.imageUrl, ...(product.additionalImages || [])];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <ImageGallery images={allImages} productName={product.name} />
        </div>

        <div className="lg:col-span-4">
          <ProductInfo
            product={product}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            handleAddToCart={handleAddToCart}
          />
        </div>

        <div className="lg:col-span-4 ">
          <PaymentDetails
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
            selectedShipping={selectedShipping}
            setSelectedShipping={setSelectedShipping}
            shippingRates={shippingRates}
            calculations={calculations}
            couponData={CouponData}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            handleAddToCart={handleAddToCart}
          />
        </div>

        <div className="lg:col-span-8">
          <ProductTabs product={product} />
        </div>
      </div>

      {/* UPDATED: Render the Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </>
  );
}
