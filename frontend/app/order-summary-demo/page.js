"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTruck, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { ShippingMethodSelector } from '@/app/Components';
import CartTotals from '@/app/Components/Cart/CartTotals';

export default function OrderSummaryDemo() {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Sample cart items
  const [cartItems] = useState([
    { id: 1, name: "Wireless Headphones", price: 79.99, quantity: 1 },
    { id: 2, name: "Phone Case", price: 19.99, quantity: 2 },
    { id: 3, name: "USB Cable", price: 12.99, quantity: 1 }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatic calculation using useMemo
  const orderCalculations = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
    const discount = 0; // No discount for this demo
    const total = subtotal + shippingCost - discount;

    return {
      subtotal,
      shippingCost,
      discount,
      total
    };
  }, [cartItems, selectedShippingMethod]);

  const handleShippingMethodChange = (method) => {
    setSelectedShippingMethod(method);
    console.log('🔄 Recalculating order total with new shipping method:', {
      method: method.name,
      price: method.price,
      newTotal: orderCalculations.subtotal + parseFloat(method.price)
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading order summary demo...</p>
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
            🧮 Order Summary Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Watch the order total recalculate automatically when shipping method changes
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiDollarSign />
                Order Summary
              </h3>
              
              <CartTotals
                subtotal={orderCalculations.subtotal}
                shipping={orderCalculations.shippingCost}
                discount={orderCalculations.discount}
                total={orderCalculations.total}
                shippingMethodName={selectedShippingMethod?.name || selectedShippingMethod?.title}
                selectedShippingMethod={selectedShippingMethod}
                showShipping={true}
              />

              {/* Real-time calculation indicator */}
              <motion.div 
                className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                key={orderCalculations.total}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FiRefreshCw className="text-green-600 w-4 h-4" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Auto-calculated
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Order total updates automatically when shipping method changes
                </p>
              </motion.div>

              {/* Action Button */}
              <button
                disabled={!selectedShippingMethod}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  selectedShippingMethod
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedShippingMethod ? `Proceed with $${orderCalculations.total.toFixed(2)}` : 'Select Shipping Method'}
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Breakdown */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Calculation Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Cart Subtotal</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${orderCalculations.subtotal.toFixed(2)}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Sum of all items
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Shipping Cost</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {orderCalculations.shippingCost === 0 ? 'Free' : `$${orderCalculations.shippingCost.toFixed(2)}`}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {selectedShippingMethod ? selectedShippingMethod.name : 'Not selected'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Discount</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${orderCalculations.discount.toFixed(2)}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                No discount applied
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Grand Total</h4>
              <motion.p 
                className="text-2xl font-bold text-orange-600 dark:text-orange-400"
                key={orderCalculations.total}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                ${orderCalculations.total.toFixed(2)}
              </motion.p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Subtotal + Shipping - Discount
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
