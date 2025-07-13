// components/Product/PaymentDetails.jsx
"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function PaymentDetails({
  product,
  quantity,
  setQuantity,
  selectedShipping,
  setSelectedShipping,
  shippingRates,
  calculations,
  couponData,
  appliedCoupon,
  setAppliedCoupon,
  handleAddToCart,
}) {
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const { productPrice, shippingCost, discountAmount, vat, total } =
    calculations;
  const vatRate = 0.05;

  const handleApplyCoupon = () => {
    const coupon = couponData.find(
      (c) => c.code.toLowerCase() === couponCodeInput.toLowerCase()
    );
    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success(`🎉 Coupon "${coupon.code}" applied!`);
    } else {
      setAppliedCoupon(null);
      toast.error("❌ Invalid coupon code.");
    }
  };

  const handleClearCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    toast.info("ℹ️ Coupon cleared.");
  };

  return (
    <div className="bg-[var(--color-second-bg)] w-full p-6 rounded-lg border border-border shadow-md sticky top-100 mt-0">
      <h2 className="raleway font-bold py-2 text-center text-primary-foreground bg-primary rounded-lg mb-6">
        Order Summary
      </h2>
      <div className="mb-6 flex flex-row justify-between items-center">
        <h3 className="font-semibold text-lg text-foreground mb-3">
          Quantity:
        </h3>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-24 p-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring"
        />
      </div>
      <h3 className="mb-1 text-md font-medium text-foreground">
        Choose Shipping Method:
      </h3>
      {/* UPDATED: Changed from grid to flex for better responsiveness */}
      <ul className="flex flex-col sm:flex-row w-full gap-4">
        <li className="flex-1">
          <input
            type="radio"
            id="by-air"
            value="air"
            className="hidden peer"
            checked={selectedShipping === "air"}
            onChange={() => setSelectedShipping("air")}
          />
          <label
            htmlFor="by-air"
            className="inline-flex items-center justify-between w-full p-3 text-foreground bg-[var(--color-background)] border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary hover:bg-muted transition-colors"
          >
            <div className="block">
              <div className="w-full text-lg font-semibold">By Air</div>
              <div className="w-full text-sm text-muted-foreground">
                ৳{shippingRates.air}
              </div>
            </div>
          </label>
        </li>
        <li className="flex-1">
          <input
            type="radio"
            id="by-sea"
            value="sea"
            className="hidden peer"
            checked={selectedShipping === "sea"}
            onChange={() => setSelectedShipping("sea")}
          />
          <label
            htmlFor="by-sea"
            className="inline-flex items-center justify-between w-full p-3 text-foreground bg-[var(--color-background)] border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary hover:bg-muted transition-colors"
          >
            <div className="block">
              <div className="w-full text-lg font-semibold">By Sea</div>
              <div className="w-full text-sm text-muted-foreground">
                ৳{shippingRates.sea}
              </div>
            </div>
          </label>
        </li>
      </ul>
      <div className="mt-6 mb-4">
        <h3 className="font-semibold text-lg text-foreground mb-1">
          Apply Coupon:
        </h3>
        {/* UPDATED: Flex container stacks on small screens to prevent overflow */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCodeInput}
            onChange={(e) => setCouponCodeInput(e.target.value)}
            className="flex-1 p-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring"
          />
          {!appliedCoupon ? (
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Apply
            </button>
          ) : (
            <button
              onClick={handleClearCoupon}
              className="px-4 py-2 bg-destructive text-primary-foreground rounded-lg font-medium hover:bg-destructive/80 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {appliedCoupon && (
          <p className="text-color-accent-green text-sm mt-2 font-medium">
            Coupon "{appliedCoupon.code}" applied: {appliedCoupon.discount}%
            off!
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 mt-5">
        <div className="pb-3 border-b border-border flex justify-between items-center">
          <h2 className="lato text-sm font-bold text-foreground">
            Price (x{quantity})
          </h2>
          <h2 className="lato text-sm font-normal text-muted-foreground">
            ${(productPrice * quantity).toFixed(2)}
          </h2>
        </div>
        <div className="pb-3 border-b border-border flex justify-between">
          <h2 className="lato text-sm font-bold text-foreground">
            Shipping Cost
          </h2>
          <h2 className="lato text-sm font-normal text-muted-foreground">
            ${shippingCost.toFixed(2)}
          </h2>
        </div>
        {appliedCoupon && (
          <div className="pb-3 border-b border-border flex justify-between text-color-accent-green">
            <h2 className="lato text-sm font-bold">
              Discount ({appliedCoupon.discount}%)
            </h2>
            <h2 className="lato text-sm font-bold">
              -${discountAmount.toFixed(2)}
            </h2>
          </div>
        )}
        <div className="pb-3 border-b border-border flex justify-between">
          <h2 className="lato text-sm font-bold text-foreground">
            VAT ({vatRate * 100}%)
          </h2>
          <h2 className="lato text-sm font-normal text-muted-foreground">
            ${vat.toFixed(2)}
          </h2>
        </div>
        <div className="pb-3 flex justify-between text-primary-600 dark:text-primary-400">
          <h2 className="lato text-lg font-bold">Total</h2>
          <h2 className="lato text-lg font-bold">${total.toFixed(2)}</h2>
        </div>
        <div className="pt-3">
          <div className="flex flex-row justify-between w-full gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`bg-primary p-3 rounded-lg text-primary-foreground font-bold w-full text-center transition-colors duration-200 ${
                product.inStock
                  ? "hover:bg-primary/90"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              Add to Cart
            </button>
            <button
              disabled={!product.inStock}
              className={`bg-destructive p-3 rounded-lg text-primary-foreground font-bold w-full text-center transition-colors duration-200 ${
                product.inStock
                  ? "hover:bg-destructive/90"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
