// app/Components/Cart/CartItem.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";

// This component displays a single item in the shopping cart.
const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const placeholderImage = 'https://placehold.co/100x100/f0f0f0/ccc.png?text=No+Image';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-4 p-4"
    >
      <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-[var(--color-second-bg)] flex-shrink-0">
        <Image
          src={item.thumbnail_url || placeholderImage}
          alt={item.name}
          fill
          className="object-cover"
          sizes="100px"
          onError={(e) => { e.currentTarget.src = placeholderImage; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`} passHref>
           <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">{item.name}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-[var(--text-primary)] mt-1">
          {item.selectedSize && <span>Size: {item.selectedSize.name}</span>}
          {item.selectedColor && (
            <div className="flex items-center gap-1.5">
              {item.selectedSize && <span className="text-gray-300 dark:text-gray-600">|</span>}
              <span>Color:</span>
              <span
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: item.selectedColor.hex_code }}
                title={item.selectedColor.name}
              />
            </div>
          )}
        </div>
        <p className="text-lg font-bold text-primary mt-2">
          ${item.price.toFixed(2)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-8 text-center font-medium text-foreground">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>
        <button
          onClick={() => onRemoveItem(item.variantId)}
          className="text-muted-foreground hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
