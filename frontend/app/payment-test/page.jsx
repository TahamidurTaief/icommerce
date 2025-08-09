"use client";

import { useState } from "react";
import { OrderPaymentModal } from "../Components/Payment";

export default function PaymentTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  // Sample data for testing
  const sampleCartItems = [
    {
      id: 1,
      product_id: 1,
      name: "Test Product 1",
      quantity: 2,
      price: 50.00,
      color_id: 1,
      size_id: 1
    },
    {
      id: 2,
      product_id: 2,
      name: "Test Product 2", 
      quantity: 1,
      price: 75.00,
      color_id: 2,
      size_id: 2
    }
  ];

  const sampleShippingMethod = {
    id: 1,
    name: "Standard Delivery",
    price: "15.00",
    description: "Delivery within 3-5 business days"
  };

  const sampleUserDetails = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main Street",
    city: "New York",
    zip: "10001"
  };

  const totalAmount = sampleCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + parseFloat(sampleShippingMethod.price);
  const cartSubtotal = sampleCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePaymentSuccess = (result) => {
    setOrderResult(result);
    console.log("Payment successful:", result);
    // The modal will automatically redirect to /confirmation
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Modal Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the enhanced payment modal with responsive design and improved error handling
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Test Data Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Test Data
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Cart Items:</h3>
                <div className="space-y-2">
                  {sampleCartItems.map(item => (
                    <div key={item.id} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {item.name} - Qty: {item.quantity} - ৳{item.price}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Shipping:</h3>
                <div className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {sampleShippingMethod.name} - ৳{sampleShippingMethod.price}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Total:</h3>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  ৳{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Test Instructions
            </h2>
            
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Responsive Design</p>
                  <p className="text-sm">Modal should be scrollable on small screens and properly sized on larger screens.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Error Handling</p>
                  <p className="text-sm">Try submitting with invalid data to see improved error messages.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Success Flow</p>
                  <p className="text-sm">Complete the form to test automatic redirect to confirmation page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Open Payment Modal
          </button>
        </div>

        {/* Result Display */}
        {orderResult && (
          <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Payment Success!
            </h3>
            <pre className="text-sm text-green-700 dark:text-green-300 overflow-x-auto">
              {JSON.stringify(orderResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Payment Modal */}
        <OrderPaymentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handlePaymentSuccess}
          cartItems={sampleCartItems}
          totalAmount={totalAmount}
          cartSubtotal={cartSubtotal}
          shippingMethod={sampleShippingMethod}
          userDetails={sampleUserDetails}
          redirectToConfirmation={true}
        />
      </div>
    </div>
  );
}
