"use client";

import { useState } from 'react';
import { ShippingMethodSelector } from '@/app/Components';

export default function ShippingExamplePage() {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  const handleShippingMethodChange = (method) => {
    setSelectedShippingMethod(method);
    console.log('Selected shipping method:', method);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shipping Method Selection Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your preferred shipping method from the options below.
          </p>
        </div>

        {/* Shipping Method Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <ShippingMethodSelector
            onSelectionChange={handleShippingMethodChange}
            title="Choose Shipping Method"
            className="mb-6"
          />

          {/* Selected Method Display */}
          {selectedShippingMethod && (
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Selected Shipping Method:
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>{selectedShippingMethod.title || selectedShippingMethod.name}</strong> - ${selectedShippingMethod.price}
              </p>
              {selectedShippingMethod.description && (
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  {selectedShippingMethod.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use This Component
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <p>1. <strong>Select a shipping method</strong> by clicking on any card.</p>
            <p>2. <strong>View details</strong> by clicking the info icon in the top-right of each card.</p>
            <p>3. <strong>Get selection updates</strong> through the onSelectionChange callback.</p>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Example Usage:</h3>
            <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
{`<ShippingMethodSelector
  onSelectionChange={(method) => setShipping(method)}
  selectedMethodId={currentShipping?.id}
  title="Choose Shipping Method"
  className="mb-6"
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
