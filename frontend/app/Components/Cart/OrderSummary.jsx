"use client";

import CartItem from "./CartItem";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

// This component displays the list of items in the cart.
const OrderSummary = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="bg-[var(--color-second-bg)] rounded-xl border border-[var(--color-border)] shadow-lg w-full">
      <div className="p-4 border-b border-[var(--color-border)]">
        {/* FIX: Corrected the invalid CSS class name here */}
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] lato">
          Shopping Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)
        </h2>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        <AnimatePresence>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => {
              // Generate a unique key prioritizing variantId, then id, then fallback to index
              const uniqueKey = item.variantId || 
                               (item.id ? `item-${item.id}` : null) || 
                               `cart-item-${index}`;
              
              return (
                <CartItem
                  key={uniqueKey}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                />
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-12"
            >
              <ShoppingCart size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Your cart is empty</h3>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                href="/products"
                className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-opacity"
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
