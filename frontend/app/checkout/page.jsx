"use client";
import React, { useState, useEffect } from 'react';
import { CheckoutProvider } from "../contexts/CheckoutContext";
import { useModal } from "../contexts/ModalContext";
import { useMessage } from "@/context/MessageContext";
import { useAuth } from "../contexts/AuthContext"; // Add auth context
import { getCheckoutData, createOrderWithPayment, validateCoupon, applyCoupon, confirmPayment } from '../lib/api';
import { applyCouponUnified } from '../../lib/couponUtils';
import { motion, AnimatePresence } from 'framer-motion';


// Simple inline CheckoutProcess component for testing
const CheckoutProcess = ({ 
  initialCartItems = [], 
  initialShippingMethods = [], 
  initialActiveCoupons = [], 
  serverError = null,
  timestamp = null 
}) => {
  const { showModal } = useModal();
  const { showError } = useMessage();
  const { isAuthenticated, user, getAccessToken } = useAuth(); // Add auth context
  
  // Shipping address state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [adminAccountNumber, setAdminAccountNumber] = useState('01970080484');
  
  // Payment accounts API state
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  // Shipping methods state - initialized with server data
  const [shippingMethods, setShippingMethods] = useState(initialShippingMethods);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(
    initialShippingMethods.length > 0 ? initialShippingMethods[0] : null
  );
  const [showShippingInfoModal, setShowShippingInfoModal] = useState(false);
  const [selectedShippingInfo, setSelectedShippingInfo] = useState(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  
  // Cart state - loaded from localStorage like the cart page
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Available coupons from server
  const [availableCoupons] = useState(initialActiveCoupons);
  
  const subtotal = cartItems.reduce((sum, item) => {
    const price = (() => {
      const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
      return isNaN(parsed) ? 0 : parsed;
    })();
    const quantity = (() => {
      const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
      return isNaN(parsed) ? 0 : parsed;
    })();
    return sum + (price * quantity);
  }, 0);
  const shipping = selectedShippingMethod ? (() => {
    const parsed = typeof selectedShippingMethod.price === 'number' ? selectedShippingMethod.price : parseFloat(selectedShippingMethod.price || 0);
    return isNaN(parsed) ? 0 : parsed;
  })() : 0;
  const total = subtotal + shipping - discount;

  // Load cart items from localStorage on mount (same as cart page)
  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem("cartItems");
        setCartItems([]);
      }
    }
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (mounted && cartItems.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  // Initialize component with server data
  useEffect(() => {
    if (serverError) {
      console.error('Server error on checkout data fetch:', serverError);
      setCouponMessage('Some data may not be current due to server issues');
      setTimeout(() => setCouponMessage(''), 5000);
    }
    
    if (timestamp) {
      console.log('Checkout data fetched at:', timestamp);
    }
    
    // Set default shipping method if not already set
    if (!selectedShippingMethod && initialShippingMethods.length > 0) {
      setSelectedShippingMethod(initialShippingMethods[0]);
    }
  }, [serverError, timestamp, selectedShippingMethod, initialShippingMethods]);

  // Enhanced quantity control functions with localStorage (same as cart page)
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems(items => 
      items.map(item => 
        (item.id === itemId || item.variantId === itemId) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const incrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const decrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      handleRemoveItem(itemId);
    }
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId && item.variantId !== itemId));
    showModal({
      status: 'success',
      title: 'Item Removed',
      message: 'Item has been removed from your cart.',
      primaryActionText: 'OK'
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponMessage('');
    
    try {
      const result = await applyCouponUnified(couponCode, cartItems, subtotal);
      
      if (result.success) {
        setDiscount(result.discount);
        setCouponApplied(true);
        setCouponMessage(result.message);
        showModal({
          status: 'success',
          title: 'Coupon Applied!',
          message: result.message,
          primaryActionText: 'Continue Shopping'
        });
      } else {
        showModal({
          status: 'error',
          title: result.minPurchase ? 'Minimum Purchase Required' : 'Invalid Coupon',
          message: result.error,
          primaryActionText: 'Try Again'
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      showModal({
        status: 'error',
        title: 'Coupon Error',
        message: 'There was an error applying your coupon. Please try again.',
        primaryActionText: 'Try Again'
      });
    }
    
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(0);
    setCouponMessage('');
    setIsApplyingCoupon(false);
    
    showModal({
      status: 'success',
      title: 'Coupon Removed',
      message: 'The coupon has been successfully removed from your order.',
      primaryActionText: 'Continue Shopping'
    });
  };

  const handleProceedToPayment = () => {
    // Validate shipping address fields
    const requiredFields = [
      { value: firstName.trim(), name: 'First Name' },
      { value: lastName.trim(), name: 'Last Name' },
      { value: streetAddress.trim(), name: 'Street Address' },
      { value: phoneNumber.trim(), name: 'Phone Number' },
      { value: city.trim(), name: 'City' },
      { value: zipCode.trim(), name: 'ZIP Code' }
    ];

    const emptyFields = requiredFields.filter(field => !field.value);
    
    if (emptyFields.length > 0) {
      showError('Please complete all required shipping address fields.', 'Shipping Address Required');
      return;
    }

    // If validation passes, open payment modal with total amount
    setShowPaymentModal(true);
    
    // Fetch payment accounts when modal opens
    fetchPaymentAccounts();
  };

  const fetchPaymentAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await fetch('/api/payment/accounts/');
      if (response.ok) {
        const accounts = await response.json();
        setPaymentAccounts(accounts);
        
        // Set the first active account as default if available
        if (accounts.length > 0) {
          const defaultAccount = accounts.find(acc => acc.is_active) || accounts[0];
          if (defaultAccount.account_number) {
            setAdminAccountNumber(defaultAccount.account_number);
            setPaymentMethod(defaultAccount.payment_method || 'bkash');
          }
        }
      } else {
        console.error('Failed to fetch payment accounts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching payment accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setTransactionNumber('');
    setTransactionId('');
    setComment('');
    setIsProcessingPayment(false);
    setPaymentAccounts([]);
    setLoadingAccounts(false);
  };

  const handleShippingMethodSelect = (method) => {
    setSelectedShippingMethod(method);
  };

  const handleShowShippingInfo = (method) => {
    setSelectedShippingInfo(method);
    setShowShippingInfoModal(true);
  };

  const handleCloseShippingInfoModal = () => {
    setShowShippingInfoModal(false);
    setSelectedShippingInfo(null);
  };

  const submitPayment = async () => {
    // Validate inputs
    if (!transactionNumber.trim()) {
      showModal({
        status: 'warning',
        title: 'Missing Information',
        message: 'Please enter a transaction number',
        primaryActionText: 'OK'
      });
      return;
    }
    
    if (!transactionId.trim()) {
      showModal({
        status: 'warning',
        title: 'Missing Information',
        message: 'Please enter a transaction ID',
        primaryActionText: 'OK'
      });
      return;
    }

    // Additional validation for minimum length
    if (transactionNumber.trim().length < 5) {
      showModal({
        status: 'warning',
        title: 'Invalid Information',
        message: 'Transaction number must be at least 5 characters long',
        primaryActionText: 'OK'
      });
      return;
    }

    if (transactionId.trim().length < 5) {
      showModal({
        status: 'warning',
        title: 'Invalid Information',
        message: 'Transaction ID must be at least 5 characters long',
        primaryActionText: 'OK'
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Validate subtotal consistency before sending
      const frontendSubtotal = subtotal; // Using the calculated subtotal from state
      const itemsSubtotal = cartItems.reduce((sum, item) => {
        const price = (() => {
          const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
          return isNaN(parsed) ? 0 : parsed;
        })();
        const quantity = (() => {
          const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
          return isNaN(parsed) ? 0 : parsed;
        })();
        return sum + (price * quantity);
      }, 0);

      const difference = Math.abs(frontendSubtotal - itemsSubtotal);
      const toleranceThreshold = 0.01; // Allow 1 cent difference for floating point precision

      if (difference > toleranceThreshold) {
        console.warn('⚠️ Subtotal mismatch detected:', {
          frontendSubtotal: frontendSubtotal.toFixed(2),
          itemsSubtotal: itemsSubtotal.toFixed(2),
          difference: difference.toFixed(2)
        });

        // Show warning modal but continue with submission
        const shouldContinue = await new Promise((resolve) => {
          showModal({
            status: 'warning',
            title: 'Calculation Discrepancy Detected',
            message: `There's a small difference in price calculations:\n\nDisplay Total: ৳${frontendSubtotal.toFixed(2)}\nItems Total: ৳${itemsSubtotal.toFixed(2)}\nDifference: ৳${difference.toFixed(2)}\n\nThe server will calculate the final amount. Continue with order?`,
            primaryActionText: 'Continue Order',
            secondaryActionText: 'Cancel',
            onPrimaryAction: () => resolve(true),
            onSecondaryAction: () => resolve(false)
          });
        });

        if (!shouldContinue) {
          setIsProcessingPayment(false);
          return;
        }
      }

      // Create or get shipping address (for now, we'll create an inline object)
      // In a real implementation, this would be saved as an Address model first
      const shippingAddressData = {
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        zip_code: zipCode.trim(),
        country: 'Bangladesh' // Default country
      };

      // Format the payload according to OrderCreateSerializer
      const payload = {
        customer_name: `${firstName.trim()} ${lastName.trim()}`,
        customer_email: emailAddress.trim(),
        customer_phone: phoneNumber.trim(),
        shipping_address: shippingAddressData, // Will be handled by backend to create Address if needed
        shipping_method: selectedShippingMethod?.id,
        items: cartItems.map(item => {
          const price = (() => {
            const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
            return isNaN(parsed) ? 0 : parsed;
          })();
          const quantity = (() => {
            const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
            return isNaN(parsed) ? 0 : parsed;
          })();
          return {
            product: item.id || item.product_id,
            color: item.color_id || null,
            size: item.size_id || null,
            quantity: quantity,
            unit_price: price
          };
        }),
        coupon_code: couponApplied ? couponCode.trim() : undefined,
        payment: {
          sender_number: transactionNumber.trim(),
          transaction_id: transactionId.trim(),
          payment_method: paymentMethod,
          admin_account_number: adminAccountNumber
        },
        // Include frontend calculations for server-side validation
        frontend_subtotal: frontendSubtotal,
        frontend_total: total
      };

      console.log('🚀 Submitting order with payload:', payload);

      // Get JWT token if available (use accessToken as stored by AuthContext)
      const token = getAccessToken(); // Use the auth context helper
      console.log('🔐 Token found:', token ? 'Yes' : 'No');
      console.log('🔐 User authenticated:', isAuthenticated);
      console.log('🔐 User info:', user);
      
      // Set up fetch options
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      };

      // Add Authorization header if JWT token exists
      if (token) {
        fetchOptions.headers.Authorization = `Bearer ${token}`;
      }

      // Submit the order
      const response = await fetch('/api/orders/submit/', fetchOptions);
      const result = await response.json();

      console.log('📦 Order submission response:', result);

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(errorMessages);
        } else if (result.detail) {
          throw new Error(result.detail);
        } else {
          throw new Error(`Order submission failed: ${response.status} ${response.statusText}`);
        }
      }
      
      // Check for server-side calculation warnings
      if (result.warnings && result.warnings.length > 0) {
        console.warn('⚠️ Server calculation warnings:', result.warnings);
        
        // Show warning but continue with success flow
        showModal({
          status: 'warning',
          title: 'Order Processed with Notes',
          message: `Your order was successfully placed, but the server noted:\n\n${result.warnings.join('\n')}\n\nThe final amount has been calculated by the server.`,
          primaryActionText: 'Continue',
          onPrimaryAction: () => {
            // Continue to success flow
            handleSuccessFlow(result);
          }
        });
        return;
      }
      
      // Normal success flow
      handleSuccessFlow(result);
      
    } catch (error) {
      console.error('❌ Order submission error:', error);
      showModal({
        status: 'error',
        title: 'Order Failed',
        message: `Order submission failed: ${error.message}`,
        primaryActionText: 'Try Again',
        secondaryActionText: 'Cancel',
        onSecondaryAction: () => {
          setIsProcessingPayment(false);
        }
      });
      setIsProcessingPayment(false);
    }
  };

  // Extract success flow into separate function for reuse
  const handleSuccessFlow = (result) => {
    // On success: close modal and show success modal
    handleCloseModal();
    
    // Clear cart from localStorage
    localStorage.removeItem('cartItems');
    setCartItems([]);
    
    showModal({
      status: 'success',
      title: 'Order Placed Successfully!',
      message: `Your order #${result.order_number || 'N/A'} has been placed successfully. You will be redirected to the confirmation page.`,
      primaryActionText: 'View Order',
      onPrimaryAction: () => {
        // Store order data for confirmation page
        sessionStorage.setItem('orderConfirmation', JSON.stringify({
          orderId: result.id,
          orderNumber: result.order_number,
          totalAmount: result.total_amount,
          status: result.status,
          paymentStatus: result.payment_status
        }));
        window.location.href = '/confirmation';
      }
    });
  };

  // Keep the old function name for backward compatibility
  const handlePayment = submitPayment;

  // Don't render until mounted to avoid hydration issues with localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100 lato">
            Checkout
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 lato">
            Complete your order with style
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* LEFT COLUMN - Checkout Forms */}
          <div className="space-y-6">
            
            {/* Shipping Address Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 lato">
                  Shipping Address
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato"
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 lato">
                  Shipping Method
                </h2>
              </div>
              
              <div className="space-y-3">
                {isLoadingShipping ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center p-6"
                  >
                    <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 lato">Loading shipping methods...</span>
                  </motion.div>
                ) : (
                  Array.isArray(shippingMethods) && shippingMethods.length > 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="grid gap-4"
                    >
                      {shippingMethods.map((method, index) => (
                        <motion.div
                          key={method.id}
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: index * 0.1,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                          whileHover={{ 
                            y: -2,
                            transition: { duration: 0.2, ease: "easeOut" }
                          }}
                          onClick={() => handleShippingMethodSelect(method)}
                          className={`relative cursor-pointer group transition-all duration-500 ease-out ${
                            selectedShippingMethod?.id === method.id 
                              ? 'transform scale-[1.02]' 
                              : 'hover:scale-[1.01]'
                          }`}
                        >
                          {/* Background Card with Enhanced Shadow */}
                          <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                            selectedShippingMethod?.id === method.id 
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-blue-800/20 shadow-xl shadow-blue-500/20' 
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-700/30'
                          }`}>
                            
                            {/* Selected State Accent */}
                            {selectedShippingMethod?.id === method.id && (
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                              />
                            )}

                            <div className="p-6">
                              <div className="flex items-start justify-between">
                                {/* Left Section */}
                                <div className="flex items-start space-x-4 flex-1">
                                  {/* Custom Radio Button */}
                                  <div className="relative mt-1">
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                        selectedShippingMethod?.id === method.id
                                          ? 'border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/30'
                                          : 'border-gray-300 dark:border-gray-500 hover:border-blue-400'
                                      }`}
                                    >
                                      {selectedShippingMethod?.id === method.id && (
                                        <motion.div
                                          initial={{ scale: 0, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ duration: 0.3, ease: "backOut" }}
                                          className="w-3 h-3 bg-white rounded-full"
                                        />
                                      )}
                                    </motion.div>
                                    
                                    {/* Selection Check Mark */}
                                    {selectedShippingMethod?.id === method.id && (
                                      <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                                      >
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </motion.div>
                                    )}
                                  </div>

                                  {/* Content Section */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className={`font-bold text-lg tracking-tight poppins ${
                                        selectedShippingMethod?.id === method.id 
                                          ? 'text-blue-900 dark:text-blue-100' 
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}>
                                        {method.name || method.title}
                                      </h3>
                                      
                                      {/* Info Button */}
                                      <motion.button
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShowShippingInfo(method);
                                        }}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                                          selectedShippingMethod?.id === method.id 
                                            ? 'bg-blue-600/20 text-blue-700 dark:text-blue-300 hover:bg-blue-600/30' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600'
                                        }`}
                                        title="View shipping details"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </motion.button>
                                    </div>

                                    {/* Delivery Time Badge */}
                                    {method.delivery_estimated_time && (
                                      <div className="mb-3">
                                        <motion.div 
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 + 0.2 }}
                                          className={`inline-flex items-center text-sm px-4 py-2 rounded-full font-semibold raleway ${
                                            selectedShippingMethod?.id === method.id 
                                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                                              : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                          }`}
                                        >
                                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          {method.delivery_estimated_time}
                                        </motion.div>
                                      </div>
                                    )}

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-3">
                                      
                                      {method.tracking_available && (
                                        <motion.div 
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 + 0.3 }}
                                          className={`flex items-center text-xs px-3 py-1.5 rounded-full font-medium raleway ${
                                            selectedShippingMethod?.id === method.id 
                                              ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30' 
                                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                                          }`}
                                        >
                                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Tracking included
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Price Section */}
                                <div className="text-right ml-6">
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 + 0.1 }}
                                    className={`font-bold text-2xl mb-1 poppins ${
                                      selectedShippingMethod?.id === method.id 
                                        ? 'text-blue-700 dark:text-blue-300' 
                                        : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                  >
                                    {(() => {
                                      const parsed = typeof method.price === 'number' ? method.price : parseFloat(method.price || 0);
                                      const normalizedPrice = isNaN(parsed) ? 0 : parsed;
                                      return normalizedPrice === 0 ? (
                                        <span className="text-green-600 dark:text-green-400">FREE</span>
                                      ) : (
                                        `$${normalizedPrice.toFixed(2)}`
                                      );
                                    })()}
                                  </motion.div>
                                  {(() => {
                                    const parsed = typeof method.price === 'number' ? method.price : parseFloat(method.price || 0);
                                    const normalizedPrice = isNaN(parsed) ? 0 : parsed;
                                    return normalizedPrice > 0;
                                  })() && (
                                    <p className={`text-xs font-medium lato ${
                                      selectedShippingMethod?.id === method.id 
                                        ? 'text-blue-600/70 dark:text-blue-400/70' 
                                        : 'text-gray-500 dark:text-gray-500'
                                    }`}>
                                      for {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item{cartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Subtle Hover Effect Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-8"
                    >
                      <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        No shipping methods available
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please try refreshing the page or contact support for assistance.
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </div>

            {/* Payment Button */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <button 
                onClick={handleProceedToPayment}
                className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 lato hover:bg-blue-700"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Proceed to Payment
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 lato">
                  Order Summary
                </h2>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {isLoadingCart ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400 lato">Loading cart items...</p>
                    </div>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center p-8">
                    <div className="mx-auto w-16 h-16 mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5h2.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 lato">Your cart is empty</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 lato">Add some products to get started</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div 
                      key={item.variantId || item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-blue-600 transition-all duration-200"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                        {item.image || item.product_image ? (
                          <img 
                            src={item.image || item.product_image} 
                            alt={item.name || item.product_name || 'Product'}
                            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${item.image || item.product_image ? 'hidden' : 'flex'}`}>
                          <svg className="w-8 h-8 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5h16.5-1.25a.75.75 0 0 0-.75-.75H5a.75.75 0 0 0-.75.75v.75Z" />
                          </svg>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.name || item.product_name || 'Product'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ${item.price ? item.price.toFixed(2) : '0.00'} each
                        </p>
                        {/* Product attributes if available */}
                        {(item.size || item.color) && (
                          <div className="flex space-x-2 mt-1">
                            {item.size && (
                              <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
                          <button
                            onClick={() => decrementQuantity(item.variantId || item.id)}
                            className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold transition-all duration-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105 active:scale-95"
                            title="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <div className="flex flex-col items-center min-w-[3rem]">
                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                              {item.quantity || 0}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {item.quantity === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => incrementQuantity(item.variantId || item.id)}
                            className="w-8 h-8 rounded-md bg-indigo-600 text-white font-bold transition-all duration-200 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95"
                            title="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Item Button */}
                        <button
                          onClick={() => handleRemoveItem(item.variantId || item.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/20 border-2 border-red-500/50 text-red-600 dark:text-red-400 transition-all duration-200 flex items-center justify-center hover:bg-red-500/30 hover:border-red-500/70 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[4rem]">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Total
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 lato">
                    Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 lato">${subtotal.toFixed(2)}</span>
                </div>

                {/* Coupon Section inside Order Summary */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 lato">
                      Have a coupon code?
                    </span>
                  </div>
                  
                  {!couponApplied ? (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 lato"
                          disabled={isApplyingCoupon}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || isApplyingCoupon}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 lato ${
                            !couponCode.trim() || isApplyingCoupon
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                          }`}
                        >
                          {isApplyingCoupon ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Applying...
                            </div>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      {couponMessage && !couponApplied && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400 bg-red-400 bg-opacity-10 border border-red-400 border-opacity-30 rounded px-2 py-1"
                        >
                          {couponMessage}
                        </motion.p>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-500"
                    >
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          ✓ {couponCode} Applied
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{couponMessage}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
                      >
                        Remove
                      </button>
                    </motion.div>
                  )}
                </div>
                
                {discount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-500"
                  >
                    <span className="text-green-600 dark:text-green-400">Discount ({couponCode})</span>
                    <span className="font-bold text-green-600 dark:text-green-400">-${discount.toFixed(2)}</span>
                  </motion.div>
                )}
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-bold text-gray-900 dark:text-white">${shipping.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600">
                  <span className="font-bold text-xl text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-2xl text-orange-500">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="bg-[var(--color-surface)] border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md w-full shadow-2xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white lato"
                >
                  Complete Your Payment
                </motion.h2>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-red-500 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Total Amount Display */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total to pay: <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    ৳ {(() => {
                      const totalAmount = parseFloat(total) || 0;
                      return totalAmount.toFixed(2);
                    })()}
                  </span>
                </h3>
              </motion.div>

              {/* Payment Method Selection */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['bkash', 'nagad', 'rocket'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                        paymentMethod === method
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Admin Account Number Display */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Send Payment To
                  </label>
                  {loadingAccounts ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">Loading account...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {adminAccountNumber}
                      </div>
                      <div className="text-xs text-blue-500 dark:text-blue-300">
                        Official payment account
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Form Fields */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 mb-6"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Transaction Number
                  </label>
                  <input
                    type="text"
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    placeholder="Enter transaction number"
                    className="w-full px-4 py-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full px-4 py-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Optional Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add any additional notes (optional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </motion.div>

              {/* Modal Actions */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex space-x-4"
              >
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                    (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) 
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105'
                  }`}
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Confirm Payment`
                  )}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Info Modal */}
      <AnimatePresence>
        {showShippingInfoModal && selectedShippingInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={handleCloseShippingInfoModal}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="bg-[var(--color-surface)] border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-lg w-full shadow-2xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white lato"
                >
                  Shipping Information
                </motion.h2>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleCloseShippingInfoModal}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-red-500 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Shipping Method Details */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-indigo-500"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white lato">
                      {selectedShippingInfo.name || selectedShippingInfo.title}
                    </h3>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-semibold"
                    >
                      {(() => {
                        const parsed = typeof selectedShippingInfo.price === 'number' ? selectedShippingInfo.price : parseFloat(selectedShippingInfo.price || 0);
                        const normalizedPrice = isNaN(parsed) ? 0 : parsed;
                        return normalizedPrice === 0 ? 'FREE' : `$${normalizedPrice.toFixed(2)}`;
                      })()}
                    </motion.div>
                  </div>
                  <p className="text-sm mb-2 text-gray-600 dark:text-gray-400 lato">
                    {selectedShippingInfo.description}
                  </p>
                  
                  {/* Shipping features grid */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {selectedShippingInfo.delivery_estimated_time && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                      >
                        <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedShippingInfo.delivery_estimated_time}
                      </motion.div>
                    )}
                    
                    {selectedShippingInfo.tracking_available && (
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center text-sm text-green-600 dark:text-green-400"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tracking included
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {selectedShippingInfo.details && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white lato flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Additional Details:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 lato leading-relaxed">
                      {selectedShippingInfo.details}
                    </p>
                  </motion.div>
                )}

                {/* Additional shipping info sections */}
                {(selectedShippingInfo.weight_limit || selectedShippingInfo.size_limit) && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white lato flex items-center">
                      <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Shipping Restrictions:
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {selectedShippingInfo.weight_limit && (
                        <p>• Maximum weight: {selectedShippingInfo.weight_limit}</p>
                      )}
                      {selectedShippingInfo.size_limit && (
                        <p>• Size limit: {selectedShippingInfo.size_limit}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action buttons */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex space-x-3 mt-6"
              >
                <button
                  onClick={handleCloseShippingInfoModal}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 lato"
                >
                  Close
                </button>
                {selectedShippingMethod?.id !== selectedShippingInfo.id && (
                  <button
                    onClick={() => {
                      handleShippingMethodSelect(selectedShippingInfo);
                      handleCloseShippingInfoModal();
                    }}
                    className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 transition-all duration-200 hover:bg-indigo-700 transform hover:scale-105 lato"
                  >
                    Select This Method
                  </button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState({
    cartItems: [],
    shippingMethods: [],
    activeCoupons: [],
    error: null,
    timestamp: null,
    isLoading: true
  });

  // Fetch checkout data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setCheckoutData(prev => ({ ...prev, isLoading: true }));
      
      try {
        const data = await getCheckoutData();
        
        // If data contains an error, handle it gracefully
        if (data.error) {
          console.warn('Checkout data fetch warning:', data.error);
          setCheckoutData({
            cartItems: data.cartItems || [],
            shippingMethods: data.shippingMethods || [{
              id: 1,
              name: 'Standard Shipping',
              price: 9.99,
              description: 'Standard delivery service with tracking included.',
              delivery_estimated_time: '5-7 business days',
              tracking_available: true
            }],
            activeCoupons: data.activeCoupons || [],
            error: data.error,
            timestamp: data.timestamp,
            isLoading: false
          });
        } else {
          setCheckoutData({
            ...data,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        
        // Provide fallback data to prevent app crash
        setCheckoutData({
          cartItems: [
            { 
              id: 1, 
              name: 'Sample Product 1', 
              price: 29.99, 
              quantity: 2,
              image: null,
              product_name: 'Sample Product 1',
              product_id: 1
            },
            { 
              id: 2, 
              name: 'Sample Product 2', 
              price: 49.99, 
              quantity: 1,
              image: null,
              product_name: 'Sample Product 2',
              product_id: 2
            }
          ],
          shippingMethods: [{
            id: 1,
            name: 'Standard Shipping',
            price: 9.99,
            description: 'Standard delivery service with tracking included.',
            delivery_estimated_time: '5-7 business days',
            tracking_available: true
          }],
          activeCoupons: [
            { code: 'SAVE10', discount_type: 'percentage', discount_value: 10, minimum_amount: 0 },
            { code: 'WELCOME15', discount_type: 'percentage', discount_value: 15, minimum_amount: 50 }
          ],
          error: 'Failed to load checkout data - using demo data',
          timestamp: new Date().toISOString(),
          isLoading: false
        });
      }
    };

    fetchData();
  }, []);

  if (checkoutData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }
  
  return (
    <CheckoutProvider>
      <div className="pb-20 md:pb-5">
        <CheckoutProcess 
          initialCartItems={checkoutData.cartItems}
          initialShippingMethods={checkoutData.shippingMethods}
          initialActiveCoupons={checkoutData.activeCoupons}
          serverError={checkoutData.error}
          timestamp={checkoutData.timestamp}
        />
      </div>
    </CheckoutProvider>
  );
}
