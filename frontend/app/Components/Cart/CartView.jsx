// app/Components/Cart/CartView.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import OrderSummary from "./OrderSummary";
import CartTotals from "./CartTotals";
import CartCoupon from "./CartCoupon";
import { CouponData } from "@/app/lib/Data/CouponData";
import CheckoutSteps from "./CheckoutSteps";

// This is the main component for the /cart page.
// It orchestrates the entire cart view, including item management and order summary.
const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Effect to load cart items from localStorage on component mount
  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem("cartItems");
      }
    }
  }, []);

  // Effect to save cart items to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  // Handler to update the quantity of an item in the cart
  const handleUpdateQuantity = (variantId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(variantId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Handler to remove an item from the cart
  const handleRemoveItem = (variantId) => {
    setCartItems(cartItems.filter((item) => item.variantId !== variantId));
    toast.info("Item removed from cart", { position: "bottom-right" });
  };

  // Handler to apply a coupon code
  const handleApplyCoupon = (code) => {
    const coupon = CouponData.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );
    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success(`Coupon "${coupon.code}" applied!`, { position: "bottom-right" });
    } else {
      toast.error("Invalid coupon code.", { position: "bottom-right" });
    }
  };

  // Memoized calculation for order totals
  const { subtotal, discountAmount, total } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let discount = 0;
    if (appliedCoupon && sub >= (appliedCoupon.conditions?.minPurchase || 0)) {
      discount = sub * (appliedCoupon.discountValue / 100);
    }
    const finalTotal = sub - discount;
    return { subtotal: sub, discountAmount: discount, total: finalTotal };
  }, [cartItems, appliedCoupon]);

  if (!mounted) {
    return null; // Show loading skeleton (loading.js) while waiting for client-side mount
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps currentStep={1} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      >
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2">
          <OrderSummary
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        {/* Right Column: Order Details Panel */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-[var(--color-second-bg)] rounded-xl border border-border shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
            <CartTotals
              subtotal={subtotal}
              discount={discountAmount}
              total={total}
              showShipping={false} // Shipping is calculated at checkout
            />
            <div className="border-t border-border"></div>
            <CartCoupon
              onApplyCoupon={handleApplyCoupon}
              appliedCoupon={appliedCoupon}
            />
            <Link href="/checkout" passHref>
              <motion.button
                className="w-full bg-[var(--color-surface)] text-[var(--color-text-primary)] font-semibold lato py-2 rounded-lg text-lg hover:bg-[var(--color-surface)]/90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.98 }}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CartView;
