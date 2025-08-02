"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCreditCard, FiSmartphone, FiDollarSign, FiLoader, FiCheckCircle } from "react-icons/fi";
import { createOrderWithPayment } from "@/app/lib/api";

const PaymentMethodOption = ({ value, label, icon: Icon, selected, onChange, description }) => {
  return (
    <motion.label
      className={`
        relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
        ${selected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input
        type="radio"
        name="payment_method"
        value={value}
        checked={selected}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      
      <div className="flex items-center space-x-3 w-full">
        <div className={`
          p-2 rounded-lg
          ${selected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}
        `}>
          <Icon 
            size={20} 
            className={selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} 
          />
        </div>
        
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {label}
          </div>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>
        
        <div className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center
          ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}
        `}>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </div>
      </div>
    </motion.label>
  );
};

const FormField = ({ label, children, error, required = false }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

const OrderPaymentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  cartItems = [],
  totalAmount = 0,
  cartSubtotal = 0, // Add cart subtotal prop
  shippingMethod = null,
  shippingAddress = null,
  userDetails = null, // Add user details prop
  adminAccountNumber = null,
  redirectToConfirmation = true // New prop to control redirection
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sender_number: '',
    transaction_id: '',
    payment_method: 'bkash'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const paymentMethods = [
    {
      value: 'bkash',
      label: 'bKash',
      icon: FiSmartphone,
      description: 'Mobile payment via bKash'
    },
    {
      value: 'nagad',
      label: 'Nagad',
      icon: FiSmartphone,
      description: 'Mobile payment via Nagad'
    },
    {
      value: 'card',
      label: 'Credit/Debit Card',
      icon: FiCreditCard,
      description: 'Pay with your credit or debit card'
    }
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: { opacity: 0, y: 30, scale: 0.95 },
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        sender_number: '',
        transaction_id: '',
        payment_method: 'bkash'
      });
      setErrors({});
      setIsSubmitting(false);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sender_number.trim()) {
      newErrors.sender_number = 'Sender number is required';
    } else if (!/^[0-9+\-\s]+$/.test(formData.sender_number)) {
      newErrors.sender_number = 'Please enter a valid phone number';
    }
    
    if (!formData.transaction_id.trim()) {
      newErrors.transaction_id = 'Transaction ID is required';
    } else if (formData.transaction_id.length < 3) {
      newErrors.transaction_id = 'Transaction ID must be at least 3 characters';
    }
    
    if (!formData.payment_method) {
      newErrors.payment_method = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate cart subtotal if not provided
      const calculatedSubtotal = cartSubtotal || cartItems.reduce(
        (sum, item) => sum + ((item.price || item.unit_price) * item.quantity), 0
      );
      
      const orderData = {
        total_amount: totalAmount,
        cart_subtotal: calculatedSubtotal,
        shipping_address: shippingAddress?.id,
        shipping_method: shippingMethod?.id,
        sender_number: formData.sender_number,
        transaction_id: formData.transaction_id,
        payment_method: formData.payment_method,
        items: cartItems.map(item => ({
          product: item.product_id || item.id,
          color: item.color_id,
          size: item.size_id,
          quantity: item.quantity,
          unit_price: item.price || item.unit_price
        }))
      };

      // Add user details if provided (for guest checkout or validation)
      if (userDetails) {
        if (userDetails.name) orderData.customer_name = userDetails.name;
        if (userDetails.email) orderData.customer_email = userDetails.email;
        if (userDetails.phone) orderData.customer_phone = userDetails.phone;
      }

      console.log('🚀 Creating order with payload:', {
        ...orderData,
        shipping_method_details: shippingMethod,
        calculated_subtotal: calculatedSubtotal,
        expected_total: calculatedSubtotal + (shippingMethod?.price ? parseFloat(shippingMethod.price) : 0)
      });

      const response = await createOrderWithPayment(orderData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setSubmitSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Show success animation briefly, then redirect
      setTimeout(() => {
        if (redirectToConfirmation) {
          // Store order data in sessionStorage for the confirmation page
          sessionStorage.setItem('orderConfirmation', JSON.stringify({
            orderId: response.order_id,
            orderNumber: response.order_number,
            totalAmount,
            shippingMethod,
            paymentMethod: formData.payment_method,
            transactionId: formData.transaction_id
          }));
          
          // Navigate to confirmation page
          router.push('/confirmation');
        } else {
          // Just close the modal if redirection is disabled
          onClose();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      setErrors({
        submit: error.message || 'Failed to create order. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Payment Information
              </h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Success State */}
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Order Created Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your order has been submitted and is being processed.
                </p>
              </motion.div>
            )}

            {/* Form */}
            {!submitSuccess && (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Admin Account Number (Read-only) */}
                {adminAccountNumber && (
                  <FormField label="Admin Account Number">
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <FiDollarSign className="text-gray-500 mr-2" size={16} />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {adminAccountNumber}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (System Generated)
                      </span>
                    </div>
                  </FormField>
                )}

                {/* Sender Number */}
                <FormField 
                  label="Your Payment Number" 
                  error={errors.sender_number}
                  required
                >
                  <input
                    type="tel"
                    value={formData.sender_number}
                    onChange={(e) => handleInputChange('sender_number', e.target.value)}
                    placeholder="e.g., 01712345678"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isSubmitting}
                  />
                </FormField>

                {/* Transaction ID */}
                <FormField 
                  label="Transaction ID" 
                  error={errors.transaction_id}
                  required
                >
                  <input
                    type="text"
                    value={formData.transaction_id}
                    onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                    placeholder="e.g., TXN123456789"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isSubmitting}
                  />
                </FormField>

                {/* Payment Method */}
                <FormField 
                  label="Payment Method" 
                  error={errors.payment_method}
                  required
                >
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <PaymentMethodOption
                        key={method.value}
                        value={method.value}
                        label={method.label}
                        icon={method.icon}
                        description={method.description}
                        selected={formData.payment_method === method.value}
                        onChange={(value) => handleInputChange('payment_method', value)}
                      />
                    ))}
                  </div>
                </FormField>

                {/* Order Summary */}
                {(totalAmount > 0 || shippingMethod) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Order Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      {totalAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${totalAmount}
                          </span>
                        </div>
                      )}
                      {shippingMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {shippingMethod.name} - ${shippingMethod.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.submit}
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin" size={16} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Submit Payment</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderPaymentModal;
