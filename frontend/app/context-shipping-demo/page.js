"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTruck, FiDollarSign, FiUsers, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { CheckoutProvider, useCheckout } from '@/app/contexts/CheckoutContext';
import ContextShippingMethodSelector from '@/app/Components/Checkout/ContextShippingMethodSelector';
import OrderSummaryCard from '@/app/Components/Checkout/OrderSummaryCard';

// Sample cart items for testing
const SAMPLE_CART_ITEMS = [
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
    quantity: 2,
    color_id: null,
    size_id: null
  },
  {
    id: 3,
    product_id: 3,
    name: "USB Cable",
    price: 12.99,
    quantity: 1,
    color_id: null,
    size_id: null
  }
];

// Context State Display Component
const ContextStateDisplay = () => {
  const { 
    cartItems, 
    selectedShippingMethod, 
    orderTotals,
    isShippingSelected,
    isCartEmpty 
  } = useCheckout();

  const { subtotal, shippingCost, total } = orderTotals;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FiRefreshCw />
        Context State (Real-time)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Cart Items</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {cartItems.length} items • Total: ${subtotal.toFixed(2)}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Shipping Method</h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              {isShippingSelected 
                ? `${selectedShippingMethod.name} - $${selectedShippingMethod.price}`
                : 'Not selected'
              }
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Shipping Cost</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              ${shippingCost.toFixed(2)}
            </p>
          </div>
          
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Grand Total</h4>
            <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Context Status</h4>
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isCartEmpty 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
          }`}>
            Cart: {isCartEmpty ? 'Empty' : 'Has Items'}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isShippingSelected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
          }`}>
            Shipping: {isShippingSelected ? 'Selected' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Cart Management Component
const CartManagement = () => {
  const { cartItems, addToCart, removeFromCart, updateCartItemQuantity, clearCart } = useCheckout();

  const handleLoadSampleCart = () => {
    SAMPLE_CART_ITEMS.forEach(item => addToCart(item));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FiShoppingCart />
        Cart Management
      </h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleLoadSampleCart}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            Load Sample Cart
          </button>
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Clear Cart
          </button>
        </div>
        
        {cartItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Current Cart Items:</h4>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Demo Content Component (inside provider)
const DemoContent = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading context demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔄 React Context Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Consistent data flow between shipping method selector and order summary
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Management */}
          <div className="lg:col-span-1 space-y-6">
            <CartManagement />
            <ContextStateDisplay />
          </div>

          {/* Middle Column - Shipping Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <ContextShippingMethodSelector 
                title="Select Shipping Method"
                className="space-y-4"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummaryCard 
                showShipping={true}
                showActions={true}
                onProceedToPayment={() => alert('Payment modal would open here!')}
              />
            </div>
          </div>
        </div>

        {/* Context Benefits */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ Context Benefits Demonstrated
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <FiRefreshCw className="text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Updates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order total updates automatically when shipping method changes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <FiCheck className="text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Consistent State</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All components share the same shipping method selection
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <FiTruck className="text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Centralized Logic</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Shipping method and price calculations in one place
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <FiUsers className="text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Integration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New components can easily access checkout state with useCheckout()
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🔧 Technical Implementation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Context Provider</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Manages cart items state</li>
                <li>• Handles shipping method selection</li>
                <li>• Calculates order totals automatically</li>
                <li>• Provides validation helpers</li>
                <li>• Persists cart data in localStorage</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Component Integration</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• useCheckout() hook for easy access</li>
                <li>• Automatic re-renders on state changes</li>
                <li>• Consistent data across all components</li>
                <li>• Type-safe state management</li>
                <li>• Optimized performance with useMemo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Demo Component (with provider wrapper)
export default function ContextShippingDemo() {
  return (
    <CheckoutProvider>
      <DemoContent />
    </CheckoutProvider>
  );
}
