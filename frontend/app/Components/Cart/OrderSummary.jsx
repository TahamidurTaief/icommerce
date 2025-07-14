// app/Components/Cart/OrderSummary.jsx
"use client";

import CartItem from "./CartItem";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const OrderSummary = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] shadow-sm w-full">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Order Summary
        </h2>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        <AnimatePresence>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartItem
                key={
                  item.id +
                  (item.selectedColor || "") +
                  (item.selectedSize || "")
                }
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-10"
            >
              <p className="text-[var(--color-text-secondary)] mb-4">
                Your cart is empty.
              </p>
              <Link
                href="/products"
                className="bg-[var(--color-button-primary)] text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Continue Shopping
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderSummary;
