"use client";

import { CheckoutProvider } from "@/app/contexts/CheckoutContext";
import ContextCheckoutProcess from "@/app/Components/Checkout/ContextCheckoutProcess";

export default function ContextCheckoutPage() {
  return (
    <CheckoutProvider>
      <div className="pb-20 md:pb-5">
        <ContextCheckoutProcess />
      </div>
    </CheckoutProvider>
  );
}
