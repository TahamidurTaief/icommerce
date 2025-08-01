"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Create the Checkout Context
const CheckoutContext = createContext();

// Custom hook to use the checkout context
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

// Checkout Provider Component
export const CheckoutProvider = ({ children }) => {
  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Shipping state
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  // User details state
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Load cart items from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart items:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart items to localStorage whenever cartItems change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  // Calculate order totals
  const orderTotals = {
    // Cart subtotal calculation
    get subtotal() {
      return cartItems.reduce((sum, item) => {
        const price = item.price || item.unit_price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
      }, 0);
    },

    // Shipping cost calculation
    get shippingCost() {
      if (!selectedShippingMethod || !selectedShippingMethod.price) {
        return 0;
      }
      return parseFloat(selectedShippingMethod.price);
    },

    // Discount calculation
    get discountAmount() {
      if (!appliedCoupon) return 0;
      
      const subtotal = this.subtotal;
      const minPurchase = appliedCoupon.conditions?.minPurchase || 0;
      
      if (subtotal >= minPurchase) {
        if (appliedCoupon.type === 'percentage') {
          return subtotal * (appliedCoupon.discountValue / 100);
        } else if (appliedCoupon.type === 'fixed') {
          return Math.min(appliedCoupon.discountValue, subtotal);
        }
      }
      return 0;
    },

    // Total calculation
    get total() {
      return Math.max(0, this.subtotal + this.shippingCost - this.discountAmount);
    }
  };

  // Shipping methods actions
  const handleShippingMethodChange = (method) => {
    setSelectedShippingMethod(method);
    console.log('🚚 Shipping method updated in context:', {
      id: method?.id,
      name: method?.name || method?.title,
      price: method?.price,
      newTotal: orderTotals.subtotal + parseFloat(method?.price || 0)
    });
  };

  // Cart actions
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => 
        cartItem.id === item.id && 
        cartItem.color_id === item.color_id && 
        cartItem.size_id === item.size_id
      );

      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id && 
          cartItem.color_id === item.color_id && 
          cartItem.size_id === item.size_id
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (itemId, colorId = null, sizeId = null) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(
        item.id === itemId && 
        item.color_id === colorId && 
        item.size_id === sizeId
      ))
    );
  };

  const updateCartItemQuantity = (itemId, quantity, colorId = null, sizeId = null) => {
    if (quantity <= 0) {
      removeFromCart(itemId, colorId, sizeId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && 
        item.color_id === colorId && 
        item.size_id === sizeId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  // Coupon actions
  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // User details actions
  const updateUserDetails = (details) => {
    setUserDetails(prev => ({ ...prev, ...details }));
  };

  // Reset checkout state
  const resetCheckout = () => {
    setSelectedShippingMethod(null);
    setSelectedPaymentMethod(null);
    setAppliedCoupon(null);
    clearCart();
  };

  // Validation helpers
  const isShippingSelected = selectedShippingMethod !== null;
  const isCartEmpty = cartItems.length === 0;
  const isUserDetailsComplete = Object.values(userDetails).every(value => value.trim() !== '');

  const contextValue = {
    // State
    cartItems,
    selectedShippingMethod,
    userDetails,
    appliedCoupon,
    selectedPaymentMethod,
    mounted,

    // Calculated values
    orderTotals,

    // Actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    handleShippingMethodChange,
    setSelectedPaymentMethod,
    applyCoupon,
    removeCoupon,
    updateUserDetails,
    resetCheckout,

    // Validation
    isShippingSelected,
    isCartEmpty,
    isUserDetailsComplete,

    // Legacy support (for backward compatibility)
    subtotal: orderTotals.subtotal,
    shippingCost: orderTotals.shippingCost,
    discountAmount: orderTotals.discountAmount,
    total: orderTotals.total,
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutContext;
