"use client";
import { useState } from 'react';
import { applyCouponUnified } from '../../lib/couponUtils';

export default function CouponTestPage() {
  const [couponCode, setCouponCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCartItems = [
    { id: 1, name: 'Test Product 1', price: 75, quantity: 1 },
    { id: 2, name: 'Test Product 2', price: 50, quantity: 1 }
  ];
  const subtotal = 125;

  const handleTest = async () => {
    if (!couponCode.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const testResult = await applyCouponUnified(couponCode, testCartItems, subtotal);
      setResult(testResult);
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Test failed: ' + error.message 
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Coupon System Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Cart</h2>
          <div className="space-y-2 mb-4">
            {testCartItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 font-semibold">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Coupon</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code (e.g., SAVE10, 20OFF, CART50)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTest}
              disabled={loading || !couponCode.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Coupon'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2"><strong>Available test coupons:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>SAVE10</code> - 10% off orders over $50</li>
              <li><code>WELCOME15</code> - 15% off any order</li>
              <li><code>CART50</code> - $50 off orders over $100</li>
              <li><code>20OFF</code> - $20 off orders over $150</li>
              <li><code>SHIPIT</code> - Free shipping over $25</li>
              <li><code>FREESHIP</code> - Free shipping over $75</li>
            </ul>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="space-y-2">
                <div><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</div>
                {result.success ? (
                  <>
                    <div><strong>Discount:</strong> ${result.discount?.toFixed(2) || '0.00'}</div>
                    <div><strong>Message:</strong> {result.message}</div>
                    <div><strong>Source:</strong> {result.source}</div>
                    <div><strong>Final Total:</strong> ${(subtotal - (result.discount || 0)).toFixed(2)}</div>
                  </>
                ) : (
                  <>
                    <div><strong>Error:</strong> {result.error}</div>
                    {result.minPurchase && (
                      <div><strong>Minimum Purchase Required:</strong> ${result.minPurchase.toFixed(2)}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
