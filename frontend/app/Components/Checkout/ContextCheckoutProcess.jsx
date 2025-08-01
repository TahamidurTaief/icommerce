"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

import { useCheckout } from "@/app/contexts/CheckoutContext";
import CheckoutSteps from "../Cart/CheckoutSteps";
import CheckoutForm from "../Cart/CheckoutForm";
import OrderPaymentModal from "../Payment/OrderPaymentModal";
import PaymentMethods from "../Cart/PaymentMethods";
import CartCoupon from "../Cart/CartCoupon";
import ContextShippingMethodSelector from "./ContextShippingMethodSelector";
import OrderSummaryCard from "./OrderSummaryCard";
import { CouponData } from "@/app/lib/Data/CouponData";

const ContextCheckoutProcess = () => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    cartItems,
    selectedShippingMethod,
    userDetails,
    updateUserDetails,
    orderTotals,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isShippingSelected,
    isCartEmpty,
    resetCheckout
  } = useCheckout();

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleApplyCoupon = (code) => {
    const coupon = CouponData.find((c) => c.code.toLowerCase() === code.toLowerCase());
    if (coupon) {
      applyCoupon(coupon);
      toast.success(`Coupon "${coupon.code}" applied!`);
    } else {
      toast.error("Invalid coupon code.");
    }
  };

  const handlePaymentSelection = (method) => {
    if (isCartEmpty) {
      toast.error("Your cart is empty.");
      return;
    }

    const isUserDetailsComplete = Object.values(userDetails).every(value => value.trim() !== "");
    if (!isUserDetailsComplete) {
      toast.error("Please fill out all delivery details first.");
      return;
    }
    
    if (!isShippingSelected) {
      toast.error("Please select a shipping method.");
      return;
    }
    
    setSelectedPaymentMethod(method);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (response) => {
    console.log("Order Confirmed:", {
      response,
      userDetails,
      orderItems: cartItems,
      orderTotals,
      shippingMethod: selectedShippingMethod,
    });

    toast.success("Order Placed Successfully!");
    
    // Reset checkout state
    resetCheckout();
    
    // The OrderPaymentModal will handle redirection to confirmation page
  };

  const getCurrentStep = () => {
    if (pathname === "/checkout") return 2;
    if (pathname === "/confirmation") return 3;
    return 2;
  };

  const renderContent = () => {
    if (pathname === "/checkout") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Details Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <CheckoutForm
                formData={userDetails}
                onFormChange={updateUserDetails}
              />
            </div>

            {/* Shipping Method Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <ContextShippingMethodSelector 
                title="Choose Delivery Method"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <OrderSummaryCard 
                showShipping={true}
                showActions={true}
                onProceedToPayment={() => handlePaymentSelection('modal')}
              />

              {/* Coupon Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <CartCoupon 
                  onApplyCoupon={handleApplyCoupon} 
                  appliedCoupon={appliedCoupon} 
                  onRemoveCoupon={removeCoupon}
                />
              </div>

              {/* Payment Methods Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <PaymentMethods 
                  selectedMethod={selectedPaymentMethod} 
                  onSelect={handlePaymentSelection} 
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (pathname === "/confirmation") {
      return (
        <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto shadow-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Your order has been placed successfully.</p>
            <Link href="/products" passHref>
              <motion.button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.05 }}
              >
                Continue Shopping
              </motion.button>
            </Link>
          </motion.div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps currentStep={getCurrentStep()} />
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderContent()}
      </motion.div>
      
      <OrderPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        cartItems={cartItems}
        totalAmount={orderTotals.total}
        cartSubtotal={orderTotals.subtotal}
        shippingMethod={selectedShippingMethod}
        userDetails={userDetails}
        onSuccess={handleConfirmPayment}
        redirectToConfirmation={true}
      />
    </div>
  );
};

export default ContextCheckoutProcess;
