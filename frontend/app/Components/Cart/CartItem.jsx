// app/Components/Cart/CartItem.jsx
"use client";

import Image from "next/image";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const imageUrl =
    item.imageUrl || "https://placehold.co/100x100/E2E8F0/4A5568?text=No+Image";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-4 p-4 border-b border-[var(--color-border)]"
    >
      <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-[var(--color-second-bg)]">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/100x100/E2E8F0/4A5568?text=Error";
          }}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-[var(--color-text-primary)]">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mt-1">
          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
          {item.selectedColor && (
            <div className="flex items-center gap-1.5">
              <span>Color:</span>
              <span
                className="h-4 w-4 rounded-full border border-[var(--color-border)]"
                style={{ backgroundColor: item.selectedColor }}
              />
            </div>
          )}
        </div>
        <p className="text-lg font-bold text-[var(--color-button-primary)] mt-2">
          ${item.price.toFixed(2)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-full px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded-full hover:bg-[var(--color-second-bg)] transition-colors"
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-6 text-center font-medium text-[var(--color-text-primary)]">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded-full hover:bg-[var(--color-second-bg)] transition-colors"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>
        <button
          onClick={() => onRemoveItem(item.id)}
          className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
