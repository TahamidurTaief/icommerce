// app/Components/Cart/CartTotals.jsx
"use client";

const CartTotals = ({
  subtotal,
  shipping,
  discount,
  total,
  shippingMethodName,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-lg">
        <span className="text-[var(--color-text-secondary)]">Subtotal</span>
        <span className="font-semibold text-[var(--color-text-primary)]">
          ${subtotal.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center text-lg">
        {/* UPDATED: Displays the name of the selected shipping method */}
        <span className="text-[var(--color-text-secondary)]">
          {shippingMethodName || "Delivery"}
        </span>
        <span className="font-semibold text-[var(--color-text-primary)]">
          ${shipping.toFixed(2)}
        </span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between items-center text-lg">
          <span className="text-[var(--color-text-secondary)]">Discount</span>
          <span className="font-semibold text-[var(--color-accent-green)]">
            -${discount.toFixed(2)}
          </span>
        </div>
      )}
      <div className="border-t border-[var(--color-border)] my-3"></div>
      <div className="flex justify-between items-center text-2xl font-bold">
        <span className="text-[var(--color-text-primary)]">Total</span>
        <span className="text-[var(--color-button-primary)]">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CartTotals;
