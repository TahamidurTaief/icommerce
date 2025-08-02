"use client";

import { useState } from "react";
import { ShippingMethods, CompactShippingMethods } from "../Components/Shipping";

export default function ShippingPage() {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleSelectionChange = (method) => {
    setSelectedMethod(method);
    console.log("Selected shipping method:", method);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Shipping Methods Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Click the info icon next to each option to learn more about delivery times and coverage areas.
          </p>
        </div>
        
        {/* Full Component */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Full Display Component
          </h2>
          <ShippingMethods className="max-w-6xl mx-auto" />
        </div>

        {/* Compact Components */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <CompactShippingMethods 
              title="Shipping Options (View Only)"
              selectable={false}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <CompactShippingMethods 
              title="Select Shipping Method"
              selectable={true}
              selectedMethodId={selectedMethod?.id}
              onSelectionChange={handleSelectionChange}
            />
            
            {selectedMethod && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Selected:</strong> {selectedMethod.title || selectedMethod.name} - ${selectedMethod.price}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Usage Examples
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Full Display Component:</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono">
                  {`import { ShippingMethods } from "@/app/Components/Shipping";

<ShippingMethods className="max-w-6xl mx-auto" />`}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Compact Selectable Component:</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono">
                  {`import { CompactShippingMethods } from "@/app/Components/Shipping";

<CompactShippingMethods 
  title="Select Shipping Method"
  selectable={true}
  selectedMethodId={selectedMethod?.id}
  onSelectionChange={handleSelectionChange}
/>`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
