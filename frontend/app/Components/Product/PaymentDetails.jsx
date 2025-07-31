// ===================================================================
// app/Components/Product/PaymentDetails.jsx

"use client";
export default function PaymentDetails({ product, quantity, setQuantity, calculations, shippingMethods, selectedShipping, setSelectedShipping, isInCart, handleAddToCart, handleRemoveFromCart }) {
  const { subtotal, shippingCost, total } = calculations;
  const inStock = product.stock > 0 && product.is_active;

  return (
    <div className="bg-[var(--color-second-bg)] p-6 rounded-lg border shadow-md sticky top-28">
      <h2 className="font-bold py-2 text-center text-primary-foreground bg-primary rounded-lg mb-6">Order Summary</h2>
      
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Quantity:</h3>
        <input type="number" min="1" max={product.stock || 99} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-20 p-2 border rounded-lg text-center bg-[var(--color-background)]" />
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Shipping Method:</h3>
        <div className="space-y-2">
          {shippingMethods.map(method => (
            <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted" onClick={() => setSelectedShipping(method)}>
              <input type="radio" name="shipping" checked={selectedShipping?.id === method.id} readOnly className="w-4 h-4 text-primary focus:ring-primary"/>
              <div className="ml-3 flex-grow">
                <p className="font-medium">{method.name}</p>
              </div>
              <p className="font-semibold">${method.price}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2 text-sm border-t pt-4">
        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>${shippingCost.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-lg text-primary mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>
      
      <button 
        onClick={isInCart ? handleRemoveFromCart : handleAddToCart} 
        disabled={!inStock} 
        className={`mt-6 w-full font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          ${isInCart 
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
      >
        {inStock ? (isInCart ? 'Remove from Cart' : 'Add to Cart') : 'Out of Stock'}
      </button>
    </div>
  );
}