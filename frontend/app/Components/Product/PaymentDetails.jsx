"use client";
import { Plus, Minus } from "lucide-react";

// This component provides the order action panel. It now focuses on quantity
// and the primary add-to-cart action, with shipping removed for a cleaner flow.
export default function PaymentDetails({ 
  product, 
  quantity, 
  setQuantity, 
  isInCart, 
  handleAddToCart, 
  handleRemoveFromCart 
}) {
  const inStock = product.stock > 0 && product.is_active;
  const price = parseFloat(product.discount_price) || parseFloat(product.price) || 0;
  const subtotal = price * quantity;

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-[var(--color-second-bg)] p-6 rounded-xl border border-border shadow-lg sticky top-24">
      <div className="space-y-4">
        {/* Availability Status */}
        <div className={`text-sm font-bold py-2 px-3 rounded-md text-center ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
        </div>

        {/* Quantity Selector */}
        <div>
          <h3 className="font-semibold text-md mb-2">Quantity:</h3>
          <div className="flex items-center justify-between border border-border rounded-lg p-2">
            <button onClick={() => handleQuantityChange(-1)} className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50" disabled={quantity <= 1}>
              <Minus size={16} />
            </button>
            <span className="font-bold text-lg w-12 text-center">{quantity}</span>
            <button onClick={() => handleQuantityChange(1)} className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50" disabled={quantity >= (product.stock || 99)}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-border my-5"></div>

      {/* Simplified Order Summary */}
      <div className="space-y-2 text-md">
        <div className="flex justify-between font-bold text-xl text-foreground">
          <span>Subtotal</span>
          <span className="text-primary">${subtotal.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Action Button */}
      <button 
        onClick={isInCart ? handleRemoveFromCart : handleAddToCart} 
        disabled={!inStock} 
        className={`mt-6 w-full font-semibold py-2 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          ${isInCart 
            ? 'bg-red-500 text-white hover:bg-red-500' 
            : 'bg-[var(--color-background)] text-var(--text-primary) hover:bg-primary/90'
          }`}
      >
        {inStock ? (isInCart ? 'Remove from Cart' : 'Add to Cart') : 'Out of Stock'}
      </button>
    </div>
  );
}
