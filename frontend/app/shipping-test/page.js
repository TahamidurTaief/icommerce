"use client";

import { useState, useEffect } from 'react';
import { ShippingMethodSelector } from '@/app/Components';

export default function ShippingTestPage() {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShippingMethodChange = (method) => {
    setSelectedShippingMethod(method);
    console.log('🚚 Selected shipping method:', {
      id: method.id,
      name: method.name,
      price: method.price,
      description: method.description,
      is_active: method.is_active
    });
  };

  const calculateOrderTotal = () => {
    const subtotal = 99.99; // Sample order subtotal
    const shippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
    return subtotal + shippingCost;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🚚 Shipping Method Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the shipping method selector with live Django API data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <ShippingMethodSelector
                onSelectionChange={handleShippingMethodChange}
                selectedMethodId={selectedShippingMethod?.id}
                title="Select Shipping Method"
                className="mb-6"
              />
            </div>
          </div>

          {/* Right Column - Enhanced Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                📋 Order Summary
              </h3>
              
              <div className="space-y-4">
                {/* Cart Subtotal */}
                <div className="flex justify-between items-center text-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛒</span>
                    <span className="text-gray-600 dark:text-gray-400">Cart Subtotal</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">$99.99</span>
                </div>
                
                {/* Shipping Cost */}
                <div className="flex justify-between items-center text-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚚</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedShippingMethod ? selectedShippingMethod.name || selectedShippingMethod.title : 'Shipping'}
                    </span>
                  </div>
                  <div className="text-right">
                    {selectedShippingMethod ? (
                      <span className={`font-semibold ${parseFloat(selectedShippingMethod.price) === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                        {parseFloat(selectedShippingMethod.price) === 0 
                          ? 'Free' 
                          : `$${parseFloat(selectedShippingMethod.price).toFixed(2)}`
                        }
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Not selected</span>
                    )}
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                
                {/* Grand Total */}
                <div className="flex justify-between items-center text-xl font-bold bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ${selectedShippingMethod ? calculateOrderTotal().toFixed(2) : '99.99'}
                  </span>
                </div>
              </div>

              {/* Selected Method Details */}
              {selectedShippingMethod && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Selected Method:
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Name:</strong> {selectedShippingMethod.name || selectedShippingMethod.title}
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Price:</strong> ${selectedShippingMethod.price}
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>ID:</strong> {selectedShippingMethod.id}
                    </p>
                    {selectedShippingMethod.description && (
                      <p className="text-blue-700 dark:text-blue-300 mt-2">
                        {selectedShippingMethod.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                disabled={!selectedShippingMethod}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedShippingMethod
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedShippingMethod ? 'Proceed to Payment' : 'Select Shipping Method'}
              </button>
            </div>
          </div>
        </div>

        {/* API Test Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🔧 API Test Information
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend API Call</h4>
                <code className="text-sm text-gray-700 dark:text-gray-300 block">
                  GET /api/shipping-methods/
                </code>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Expected Response</h4>
                <code className="text-sm text-gray-700 dark:text-gray-300 block">
                  [{`{id, name, description, price, is_active}`}]
                </code>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                📝 To Test:
              </h4>
              <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                <li>Make sure Django backend is running on http://localhost:8000</li>
                <li>Create shipping methods in Django admin or run management command</li>
                <li>Select different shipping methods and observe state changes</li>
                <li>Check browser console for detailed logs</li>
                <li>Test the info modal by clicking the ℹ️ icon</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
