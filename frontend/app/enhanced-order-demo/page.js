"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiUser, FiTruck, FiCreditCard, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { ShippingMethodSelector } from '@/app/Components';
import OrderPaymentModal from '@/app/Components/Payment/OrderPaymentModal';

export default function EnhancedOrderDemo() {
  const [mounted, setMounted] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Sample cart data
  const [cartItems] = useState([
    {
      id: 1,
      product_id: 1,
      name: "Wireless Headphones",
      price: 79.99,
      quantity: 1,
      color_id: null,
      size_id: null
    },
    {
      id: 2,
      product_id: 2,
      name: "Phone Case",
      price: 19.99,
      quantity: 1,
      color_id: null,
      size_id: null
    }
  ]);

  // Sample user details
  const [userDetails] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main St",
    city: "New York",
    zip: "10001"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
  const totalAmount = cartSubtotal + shippingCost;

  const handleShippingMethodChange = (method) => {
    setSelectedShippingMethod(method);
    console.log('🚚 Selected shipping method for order:', {
      id: method.id,
      name: method.name,
      price: method.price,
      total_with_shipping: cartSubtotal + parseFloat(method.price)
    });
  };

  const handlePlaceOrder = () => {
    if (!selectedShippingMethod) {
      alert('Please select a shipping method first!');
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleOrderSuccess = (response) => {
    console.log('🎉 Order created successfully:', response);
    setPaymentModalOpen(false);
    alert(`Order created successfully! Order #${response.order_number}`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading enhanced order demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🛒 Enhanced Order Creation Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the complete order flow with shipping method, cart total, and user details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiShoppingCart />
                Cart Items
              </h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">Cart Subtotal:</span>
                    <span className="text-blue-600 dark:text-blue-400">${cartSubtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <FiUser />
                  Customer Details
                </h4>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Name:</strong> {userDetails.name}</p>
                  <p><strong>Email:</strong> {userDetails.email}</p>
                  <p><strong>Phone:</strong> {userDetails.phone}</p>
                  <p><strong>Address:</strong> {userDetails.address}, {userDetails.city} {userDetails.zip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <ShippingMethodSelector
                onSelectionChange={handleShippingMethodChange}
                selectedMethodId={selectedShippingMethod?.id}
                title="Select Shipping Method"
                className="space-y-4"
              />
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiCreditCard />
                Order Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Cart Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${cartSubtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <FiTruck className={selectedShippingMethod ? 'text-blue-600' : 'text-gray-400'} />
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedShippingMethod ? selectedShippingMethod.name : 'Shipping'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedShippingMethod ? 
                      (shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`) : 
                      'Not selected'
                    }
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-blue-600 dark:text-blue-400">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedShippingMethod}
                className={`w-full mt-6 py-4 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedShippingMethod
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedShippingMethod ? (
                  <>
                    <FiCheck />
                    Place Order - ${totalAmount.toFixed(2)}
                  </>
                ) : (
                  <>
                    <FiAlertCircle />
                    Select Shipping Method
                  </>
                )}
              </button>

              {/* Order Data Preview */}
              {selectedShippingMethod && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    📦 Order Data Preview
                  </h4>
                  <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <p><strong>Shipping Method ID:</strong> {selectedShippingMethod.id}</p>
                    <p><strong>Cart Subtotal:</strong> ${cartSubtotal.toFixed(2)}</p>
                    <p><strong>Shipping Cost:</strong> ${shippingCost.toFixed(2)}</p>
                    <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
                    <p><strong>Items Count:</strong> {cartItems.length}</p>
                    <p><strong>Customer:</strong> {userDetails.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🔧 Enhanced Order Creation API
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backend Validation</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✅ Shipping method ID validation</li>
                <li>✅ Cart subtotal recalculation</li>
                <li>✅ Total amount verification</li>
                <li>✅ User details inclusion</li>
                <li>✅ Payment info processing</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payload Includes</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• shipping_method (ID)</li>
                <li>• cart_subtotal (validation)</li>
                <li>• total_amount (calculated)</li>
                <li>• customer_name, email, phone</li>
                <li>• items with product IDs</li>
                <li>• payment method & details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <OrderPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          cartItems={cartItems}
          totalAmount={totalAmount}
          cartSubtotal={cartSubtotal}
          shippingMethod={selectedShippingMethod}
          userDetails={userDetails}
          onSuccess={handleOrderSuccess}
          redirectToConfirmation={false} // Keep in demo mode
        />
      </div>
    </div>
  );
}
