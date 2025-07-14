// app/Components/Cart/CartView.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import OrderSummary from "./OrderSummary";
import CartTotals from "./CartTotals";
import CartCoupon from "./CartCoupon";
import { ShippingData } from "@/app/lib/Data/ShippingData";
import { CouponData } from "@/app/lib/Data/CouponData";
import ShippingOptions from "./ShippingOptions";

const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedShippingId, setSelectedShippingId] = useState(
    ShippingData[0].id
  ); // Default to the first shipping option
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
    toast.info("Item removed from cart", { position: "bottom-right" });
  };

  const handleApplyCoupon = (code) => {
    const coupon = CartCouponData.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );
    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success(`Coupon "${coupon.code}" applied!`, {
        position: "bottom-right",
      });
    } else {
      toast.error("Invalid coupon code.", { position: "bottom-right" });
    }
  };

  const {
    subtotal,
    shippingCost,
    discountAmount,
    total,
    selectedShippingMethod,
  } = useMemo(() => {
    const sub = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const shippingMethod = ShippingData.find(
      (s) => s.id === selectedShippingId
    );
    let shipping = shippingMethod ? shippingMethod.price : 0;

    let discount = 0;

    if (appliedCoupon) {
      if (sub >= appliedCoupon.minPurchase) {
        if (appliedCoupon.isFreeShipping) {
          shipping = 0;
        }
        discount = sub * (appliedCoupon.discountPercent / 100);
      } else {
        toast.warn(
          `You need to spend at least $${appliedCoupon.minPurchase} to use this coupon.`,
          { position: "bottom-right" }
        );
        setAppliedCoupon(null);
      }
    }

    const finalTotal = sub + shipping - discount;

    return {
      subtotal: sub,
      shippingCost: shipping,
      discountAmount: discount,
      total: finalTotal,
      selectedShippingMethod: shippingMethod,
    };
  }, [cartItems, appliedCoupon, selectedShippingId]);

  if (!mounted) {
    return null; // The loading.jsx skeleton will be shown
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      >
        <div className="lg:col-span-2">
          <OrderSummary
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Order Details
            </h2>

            {/* <ShippingOptions
              options={ShippingData}
              selectedId={selectedShippingId}
              onSelect={setSelectedShippingId}
            /> */}
            <div className="border-t border-[var(--color-border)]"></div>
            <CartTotals
              subtotal={subtotal}
              shipping={shippingCost}
              discount={discountAmount}
              total={total}
              shippingMethodName={selectedShippingMethod?.name}
            />
            <div className="border-t border-[var(--color-border)]"></div>
            <CartCoupon
              onApplyCoupon={handleApplyCoupon}
              appliedCoupon={appliedCoupon}
            />
            <Link href="/checkout">
              <motion.button
                className="w-full bg-[var(--color-button-primary)] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
