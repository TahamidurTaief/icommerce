
// ===================================================================
// app/Components/Product/PaymentDetails.jsx

"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function PaymentDetails({ product, quantity, setQuantity, calculations, handleAddToCart }) {
  const productPrice = parseFloat(calculations.productPrice) || 0;
  const total = parseFloat(calculations.total) || 0;
  const inStock = product.stock > 0 && product.is_active;

  return (
    <div className="bg-[var(--color-second-bg)] w-full p-6 rounded-lg border border-border shadow-md sticky top-28">
      <h2 className="raleway font-bold py-2 text-center text-primary-foreground bg-primary rounded-lg mb-6">Order Summary</h2>
      
      <div className="mb-6 flex flex-row justify-between items-center">
        <h3 className="font-semibold text-lg text-foreground">Quantity:</h3>
        <div className="flex items-center border rounded-md overflow-hidden">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">-</button>
          <span className="px-4 py-2 w-12 text-center font-medium">{quantity}</span>
          <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">+</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-5">
        <div className="pb-3 border-b border-border flex justify-between items-center">
          <h2 className="lato text-sm font-bold text-foreground">Price (x{quantity})</h2>
          <h2 className="lato text-sm font-normal text-muted-foreground">${(productPrice * quantity).toFixed(2)}</h2>
        </div>
        <div className="pt-3 flex justify-between text-primary-600 dark:text-primary-400">
          <h2 className="lato text-lg font-bold">Total</h2>
          <h2 className="lato text-lg font-bold">${total.toFixed(2)}</h2>
        </div>
        <div className="pt-3 mt-4">
          <button onClick={handleAddToCart} disabled={!inStock} className={`bg-primary p-3 rounded-lg text-primary-foreground font-bold w-full text-center transition-colors duration-200 ${inStock ? 'hover:bg-primary/90' : 'opacity-50 cursor-not-allowed'}`}>
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
