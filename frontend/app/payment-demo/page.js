"use client";

import { useState } from "react";
import { OrderPaymentModal } from "../Components/Payment";
import { CompactShippingMethods } from "../Components/Shipping";

export default function PaymentDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  // Sample cart items for demo
  const sampleCartItems = [
    {
      id: 1,
      product_id: 1,
      name: "Sample Product 1",
      quantity: 2,
      price: 25.99,
      color_id: 1,
      size_id: 1
    },
    {
      id: 2,
      product_id: 2,
      name: "Sample Product 2",
      quantity: 1,
      price: 49.99,
      color_id: 2,
      size_id: 2
    }
  ];

  // Sample shipping address
  const sampleShippingAddress = {
    id: 1,
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA"
  };

  const totalAmount = sampleCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = totalAmount + (selectedShippingMethod?.price ? parseFloat(selectedShippingMethod.price) : 0);

  const handleShippingSelection = (method) => {
    setSelectedShippingMethod(method);
  };

  const handleOpenPaymentModal = () => {
    if (!selectedShippingMethod) {
      alert("Please select a shipping method first");
      return;
    }
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = (result) => {
    setOrderResult(result);
    console.log("Order created successfully:", result);
    // The modal will automatically redirect to /confirmation page
    // You can also handle additional logic here if needed
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Modal Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This demo shows the OrderPaymentModal component with sample cart items and shipping selection.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cart Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Cart Summary
            </h2>
            
            <div className="space-y-3 mb-4">
              {sampleCartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity} × ${item.price}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold">${totalAmount.toFixed(2)}</span>
              </div>
              {selectedShippingMethod && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="font-semibold">${selectedShippingMethod.price}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <CompactShippingMethods 
              title="Select Shipping Method"
              selectable={true}
              selectedMethodId={selectedShippingMethod?.id}
              onSelectionChange={handleShippingSelection}
            />
            
            {selectedShippingMethod && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Selected:</strong> {selectedShippingMethod.title || selectedShippingMethod.name} - ${selectedShippingMethod.price}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={handleOpenPaymentModal}
            disabled={!selectedShippingMethod}
            className={`
              px-8 py-3 rounded-lg font-semibold transition-colors
              ${selectedShippingMethod 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Proceed to Payment
          </button>
          
          {!selectedShippingMethod && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please select a shipping method to continue
            </p>
          )}
        </div>

        {/* Order Result */}
        {orderResult && (
          <div className="mt-8 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
              Order Created Successfully! 🎉
            </h3>
            <div className="text-sm text-green-700 dark:text-green-300">
              <p><strong>Order ID:</strong> {orderResult.order_id}</p>
              <p><strong>Order Number:</strong> {orderResult.order_number}</p>
              <p><strong>Message:</strong> {orderResult.message}</p>
            </div>
          </div>
        )}

        {/* Usage Example */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Usage Example
          </h2>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{`import { OrderPaymentModal } from "@/app/Components/Payment";

<OrderPaymentModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSuccess={handlePaymentSuccess}
  cartItems={cartItems}
  totalAmount={totalAmount}
  shippingMethod={selectedShippingMethod}
  shippingAddress={shippingAddress}
  adminAccountNumber="ADMIN-ACC-123"
/>`}</pre>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <OrderPaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePaymentSuccess}
        cartItems={sampleCartItems}
        totalAmount={finalTotal}
        shippingMethod={selectedShippingMethod}
        shippingAddress={sampleShippingAddress}
        adminAccountNumber="ADMIN-ACC-12345"
      />
    </div>
  );
}
