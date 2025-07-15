"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";
import OrderSummary from "./OrderSummary";
import CartTotals from "./CartTotals";
import CartCoupon from "./CartCoupon";
import CheckoutSteps from "./CheckoutSteps";
import CheckoutForm from "./CheckoutForm";
import PaymentModal from "./PaymentModal";
import PaymentMethods from "./PaymentMethods";
import { CouponData } from "@/app/lib/Data/CouponData";
import { ShippingData } from "@/app/lib/Data/ShippingData";

const CheckoutProcess = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState(
    ShippingData[0].id
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems, mounted]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) handleRemoveItem(productId);
    else
      setCartItems(
        cartItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
    toast.info("Item removed from cart", { position: "bottom-right" });
  };

  const {
    subtotal,
    shippingCost,
    discountAmount,
    total,
    itemCount,
    selectedShippingMethod,
  } = useMemo(() => {
    const sub = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const shippingMethod = ShippingData.find(
      (s) => s.id === selectedShippingId
    );
    let shipping = shippingMethod ? shippingMethod.price : 0;
    let discount = 0;

    if (appliedCoupon) {
      switch (appliedCoupon.type) {
        case "percentage":
          discount = sub * (appliedCoupon.discountValue / 100);
          break;
        case "fixed":
          discount = appliedCoupon.discountValue;
          break;
        case "shipping_percentage":
          shipping *= 1 - appliedCoupon.discountValue / 100;
          break;
      }
    }
    return {
      subtotal: sub,
      shippingCost: shipping,
      discountAmount: discount,
      total: sub + shipping - discount,
      itemCount: count,
      selectedShippingMethod: shippingMethod,
    };
  }, [cartItems, appliedCoupon, selectedShippingId]);

  const handleApplyCoupon = (code) => {
    const coupon = CouponData.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );
    if (coupon) {
      const { conditions } = coupon;
      const meetsMinPurchase =
        !conditions.minPurchase || subtotal >= conditions.minPurchase;
      const meetsMinItems =
        !conditions.minItems || itemCount >= conditions.minItems;
      if (meetsMinPurchase && meetsMinItems) {
        setAppliedCoupon(coupon);
        toast.success(`Coupon "${coupon.code}" applied!`, {
          position: "bottom-right",
        });
      } else {
        toast.error(
          `Requirements not met. Spend $${
            conditions.minPurchase || 0
          } or have ${conditions.minItems || 0} items.`,
          { position: "bottom-right" }
        );
      }
    } else {
      toast.error("Invalid coupon code.", { position: "bottom-right" });
    }
  };

  // FIXED: This function now simply opens the modal.
  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (paymentDetails) => {
    // Validation for the main delivery form is now here.
    const isFormValid = Object.values(formData).every(
      (field) => field.trim() !== ""
    );
    if (!isFormValid) {
      toast.error(
        "Please fill out all delivery details before confirming payment."
      );
      return;
    }

    console.log("Order Confirmed:", {
      deliveryDetails: formData,
      paymentMethod: selectedPaymentMethod,
      paymentDetails: paymentDetails,
      orderItems: cartItems,
      orderTotal: total,
    });

    toast.success("Order Placed Successfully!");
    setCartItems([]);
    router.push("/confirmation");
  };

  const getCurrentStep = () => {
    if (pathname === "/cart") return 1;
    if (pathname === "/checkout") return 2;
    if (pathname === "/confirmation") return 3;
    return 1;
  };

  if (!mounted) return null;

  const renderContent = () => {
    switch (pathname) {
      case "/cart":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <OrderSummary
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>
            <div className="lg:col-span-1 sticky top-24">
              <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 space-y-6">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Order Details
                </h2>
                <CartTotals
                  subtotal={subtotal}
                  discount={discountAmount}
                  total={subtotal - discountAmount}
                  showShipping={false}
                />
                <div className="border-t border-[var(--color-border)]"></div>
                <CartCoupon
                  onApplyCoupon={handleApplyCoupon}
                  appliedCoupon={appliedCoupon}
                />
                <Link href="/checkout" passHref>
                  <motion.button
                    className="w-full bg-[var(--color-button-primary)] text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
                    whileTap={{ scale: 0.98 }}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        );
      case "/checkout":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <CheckoutForm
                formData={formData}
                onFormChange={setFormData}
                selectedShippingId={selectedShippingId}
                onShippingSelect={setSelectedShippingId}
              />
            </div>
            <div className="lg:col-span-1 sticky top-24">
              <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 space-y-6">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Order Summary
                </h2>
                <CartTotals
                  subtotal={subtotal}
                  shipping={shippingCost}
                  discount={discountAmount}
                  total={total}
                  shippingMethodName={selectedShippingMethod?.name}
                  showShipping={true}
                />
                <div className="border-t border-[var(--color-border)]"></div>
                <CartCoupon
                  onApplyCoupon={handleApplyCoupon}
                  appliedCoupon={appliedCoupon}
                />
                <div className="border-t border-[var(--color-border)]"></div>
                <PaymentMethods
                  selectedMethod={selectedPaymentMethod}
                  onSelect={handlePaymentSelection}
                />
              </div>
            </div>
          </div>
        );
      case "/confirmation":
        return (
          <div className="text-center bg-[var(--color-second-bg)] p-10 rounded-xl border border-[var(--color-border)]">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <h1 className="text-4xl font-bold text-[var(--color-accent-green)] mb-4">
                Thank You!
              </h1>
              <p className="text-lg text-[var(--color-text-primary)] mb-2">
                Your order has been placed successfully.
              </p>
              <Link href="/products" passHref>
                <motion.button
                  className="mt-8 bg-[var(--color-button-primary)] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.05 }}
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
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
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        paymentMethod={selectedPaymentMethod}
        totalAmount={total}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};

export default CheckoutProcess;
  