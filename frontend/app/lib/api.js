// app/lib/api.js
import { cache } from 'react';

// Normalize API base URL and ensure no trailing slash; default to local http for dev
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

// Debug API calls
const DEBUG_API = true;

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  return {};
};

// Helper function to handle 401 unauthorized responses
const handle401Redirect = () => {
  if (typeof window !== 'undefined') {
    // Clear stored auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login - check if we're not already on a public page
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/products', '/categories', '/auth'];
    const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
    
    if (!isPublicPath) {
      // Store the current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      // Trigger auth modal or redirect
      // We'll dispatch a custom event that the AuthContext can listen to
      window.dispatchEvent(new CustomEvent('authRequired', { 
        detail: { reason: 'Session expired. Please login again.' }
      }));
    }
  }
};

async function fetchAPI(endpoint, options = {}) {
  const headers = { 
    'Content-Type': 'application/json', 
    ...getAuthHeaders(),
    ...options.headers 
  };
  
  // Ensure endpoint begins with slash
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  if (DEBUG_API) {
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.parse(options.body) : null
    });
  }
  
  try {
    const response = await fetch(url, { 
      ...options, 
      headers, 
      cache: 'no-store' 
    });
    
    if (DEBUG_API) {
      console.log('🌐 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });
    }
    
    if (!response.ok) {
        // Check if response is HTML (which indicates Django error page)
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
          console.error("Server returned HTML error page instead of JSON");
          const htmlText = await response.text();
          console.error("HTML Response:", htmlText.substring(0, 200));
          return { error: `Server error: ${response.status} ${response.statusText}. The API endpoint may not exist or the server is misconfigured.` };
        }
        
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        if (errorData && (Object.keys(errorData).length > 0)) {
          console.error("Backend Error:", errorData);
        } else {
          console.error(`Backend Error: status ${response.status} ${response.statusText} at ${url}`);
        }
        
        // Handle 401 Unauthorized responses
        if (response.status === 401) {
          handle401Redirect();
          return { error: 'Authentication required. Please login again.' };
        }
        
        // Return the full error data for better error handling
        if (response.status === 400 && errorData.errors) {
          // Validation errors from our RegisterAPIView
          return { error: errorData.message || 'Validation failed', errors: errorData.errors };
        } else if (response.status === 403) {
          // Forbidden - user doesn't have permission
          return { error: errorData.detail || 'Access denied. You do not have permission to perform this action.' };
        } else if (response.status === 404) {
          // Not found - endpoint doesn't exist
          return { error: `Resource not found: ${endpoint}` };
        } else if (response.status >= 500) {
          // Server error
          return { error: 'Server error. Please try again later.' };
        } else {
          // Other errors
          return { error: errorData.detail || errorData.message || response.statusText };
        }
    }
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (response.status === 204) {
      return null;
    } else if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      if (DEBUG_API) {
        console.log('🌐 API Success:', jsonData);
      }
      return jsonData;
    } else {
      console.error("Server returned non-JSON response:", contentType);
      const textResponse = await response.text();
      console.error("Text response:", textResponse.substring(0, 200));
      return { error: 'Server returned unexpected response format' };
    }
  } catch (error) {
    console.error("Fetch API failed:", endpoint, error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { error: 'Network error. Please check your connection and ensure the server is running.' };
    }
    
    // Check for JSON parsing errors
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return { error: 'Invalid server response. The server may be returning HTML instead of JSON.' };
    }
    
    return { error: error.message || 'An unexpected error occurred' };
  }
}

// Product and related fetches
export const getProducts = async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });

    if (filters.category) {
        params.append('category', filters.category);
    }
    if (filters.brands?.length) {
        params.append('brands', filters.brands.join(','));
    }
    if (filters.colors?.length) {
        params.append('colors', filters.colors.join(','));
    }

    // FIX: Correctly access priceRange by index and ensure values are numbers
    if (filters.priceRange && Array.isArray(filters.priceRange)) {
        const minPrice = filters.priceRange[0];
        const maxPrice = filters.priceRange[1];
        
        if (typeof minPrice === 'number') {
            params.append('min_price', minPrice);
        }
        if (typeof maxPrice === 'number') {
            params.append('max_price', maxPrice);
        }
    }

    // FIX: Translate frontend sort values to backend ordering parameters
    const sortMapping = {
        'price-asc': 'price',
        'price-desc': '-price',
        'name-asc': 'name',
        'name-desc': '-name',
    };

    if (filters.sort && sortMapping[filters.sort]) {
        params.append('ordering', sortMapping[filters.sort]);
    }
    
    return fetchAPI(`/api/products/?${params.toString()}`);
};


export const getProductBySlug = cache(async (slug) => fetchAPI(`/api/products/${slug}/`));

export const getCategories = cache(async () => {
  const response = await fetchAPI('/api/categories/');
  return response?.results || response || [];
});

export const getShops = cache(async () => {
  const response = await fetchAPI('/api/shops/');
  return response?.results || response || [];
});

export const getColors = cache(async () => {
  const response = await fetchAPI('/api/colors/');
  return response?.results || response || [];
});

export const getSizes = cache(async () => {
  const response = await fetchAPI('/api/sizes/');
  return response?.results || response || [];
});

export const getInitialHomeProducts = cache(async () => fetchAPI('/api/products/?page_size=12'));

// Shipping fetches
export const getShippingMethods = cache(async () => {
  const result = await fetchAPI('/api/shipping-methods/');
  if (result?.error) {
    console.warn('Shipping methods API not available, returning fallback:', result.error);
    return [{
      id: 1,
      name: 'Standard Shipping',
      price: 9.99,
      description: '5-7 business days',
      details: 'Standard delivery service with tracking included.',
      estimated_delivery: '5-7 business days',
      tracking_available: true
    }];
  }
  
  // Ensure price is always a number
  if (Array.isArray(result)) {
    return result.map(method => ({
      ...method,
      price: (() => {
        const parsed = typeof method.price === 'number' ? method.price : parseFloat(method.price || 0);
        return isNaN(parsed) ? 0 : parsed;
      })()
    }));
  }
  
  return result;
});

// Get shipping price for specific quantity
export const getShippingPriceForQuantity = async (methodId, quantity) => {
  return fetchAPI(`/api/shipping-methods/${methodId}/price-for-quantity/?quantity=${quantity}`);
};

// Cart functions - Frontend cart uses localStorage, not backend API
export const getCart = cache(async () => {
  // Cart is handled on frontend via localStorage, not backend API
  if (typeof window !== 'undefined') {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        // Ensure price and quantity are always numbers for cart items
        return Array.isArray(cartItems) ? cartItems.map(item => ({
          ...item,
          price: (() => {
            const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
            return isNaN(parsed) ? 0 : parsed;
          })(),
          quantity: (() => {
            const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 1);
            return isNaN(parsed) ? 1 : parsed;
          })()
        })) : [];
      }
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
    }
  }
  
  // Return empty cart if no localStorage or error
  return [];
});

export const addToCart = async (productId, quantity = 1, size = null, color = null) => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      // Create a unique variant ID based on product, size, and color
      const variantId = `${productId}_${size || 'default'}_${color || 'default'}`;
      
      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.variantId === variantId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cartItems.push({
          id: productId,
          variantId,
          quantity,
          size,
          color,
          // Note: You might want to fetch product details here to get name, price, etc.
        });
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { success: true, cartItems };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { error: 'Failed to add item to cart' };
    }
  }
  
  return { error: 'localStorage not available' };
};

export const updateCartItem = async (itemId, quantity) => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const itemIndex = cartItems.findIndex(item => item.variantId === itemId);
      
      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = quantity;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        return { success: true, cartItems };
      }
      
      return { error: 'Item not found in cart' };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { error: 'Failed to update cart item' };
    }
  }
  
  return { error: 'localStorage not available' };
};

export const removeFromCart = async (itemId) => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCart = cartItems.filter(item => item.variantId !== itemId);
      
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      return { success: true, cartItems: updatedCart };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { error: 'Failed to remove item from cart' };
    }
  }
  
  return { error: 'localStorage not available' };
};

export const clearCart = async () => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('cartItems');
      console.log('✅ Cart cleared from localStorage');
      return { success: true, cartItems: [] };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { error: 'Failed to clear cart' };
    }
  }
  
  return { error: 'localStorage not available' };
};

// Clear cart after successful checkout - specifically for post-order cleanup
export const clearCartAfterCheckout = async () => {
  console.log('🛒 Clearing cart after successful checkout');
  const result = await clearCart();
  
  // Dispatch a custom event to notify components that cart has been cleared
  if (typeof window !== 'undefined' && result.success) {
    window.dispatchEvent(new CustomEvent('cartCleared', { 
      detail: { reason: 'checkout_success' } 
    }));
  }
  
  return result;
};

// Coupon functions
export const getCoupons = async () => fetchAPI('/api/coupons/');

export const getActiveCoupons = cache(async () => {
  const result = await fetchAPI('/api/coupons/');
  if (result?.error) {
    console.warn('Active coupons API not available, returning fallback:', result.error);
    return [
      { code: 'SAVE10', discount_type: 'percentage', discount_value: 10, minimum_amount: 0 },
      { code: 'WELCOME15', discount_type: 'percentage', discount_value: 15, minimum_amount: 50 }
    ];
  }
  // The backend already filters for active coupons in CouponViewSet.get_queryset()
  return Array.isArray(result) ? result : result?.results || [];
});

export const validateCoupon = async (couponCode, cartItems, cartTotal = null, userId = null) => {
  const requestBody = {
    coupon_code: couponCode,
    cart_items: cartItems
  };

  // Add optional parameters if provided
  if (cartTotal !== null) {
    requestBody.cart_total = cartTotal;
  }
  if (userId !== null) {
    requestBody.user_id = userId;
  }

  return fetchAPI('/api/coupons/validate/', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
};

// Order fetches (requires authentication)
export const getUserOrders = async (userId) => {
  if (!userId) return [];
  return fetchAPI(`/api/orders/?user=${userId}`);
};
export const getOrderDetails = async (orderNumber) => fetchAPI(`/api/orders/${orderNumber}/`);

// Order creation with payment info
export const createOrderWithPayment = async (orderData) => {
  return fetchAPI('/api/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

// Confirm payment with transaction details
export const confirmPayment = async (paymentData) => {
  return fetchAPI('/api/orders/confirm-payment/', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// Checkout data fetching function
export const getCheckoutData = async () => {
  try {
    // Fetch all required data in parallel
    const [cartResponse, shippingResponse, couponsResponse] = await Promise.allSettled([
      getCart(),
      getShippingMethods(),
      getActiveCoupons()
    ]);

    // Handle cart items
    let cartItems = [];
    if (cartResponse.status === 'fulfilled' && !cartResponse.value?.error) {
      cartItems = Array.isArray(cartResponse.value) ? cartResponse.value : cartResponse.value?.items || [];
    } else {
      console.error('Failed to fetch cart items:', cartResponse.reason || cartResponse.value?.error);
      // Fallback to empty cart
      cartItems = [];
    }

    // Handle shipping methods
    let shippingMethods = [];
    if (shippingResponse.status === 'fulfilled' && !shippingResponse.value?.error) {
      shippingMethods = Array.isArray(shippingResponse.value) ? shippingResponse.value : shippingResponse.value?.results || [];
    } else {
      console.error('Failed to fetch shipping methods:', shippingResponse.reason || shippingResponse.value?.error);
      // Fallback shipping method
      shippingMethods = [{
        id: 1,
        name: 'Standard Shipping',
        price: 9.99,
        description: '5-7 business days',
        details: 'Standard delivery service with tracking included.',
        estimated_delivery: '5-7 business days',
        tracking_available: true
      }];
    }

    // Handle active coupons
    let activeCoupons = [];
    if (couponsResponse.status === 'fulfilled' && !couponsResponse.value?.error) {
      activeCoupons = Array.isArray(couponsResponse.value) ? couponsResponse.value : couponsResponse.value?.results || [];
    } else {
      console.error('Failed to fetch active coupons:', couponsResponse.reason || couponsResponse.value?.error);
      // Fallback to empty coupons array
      activeCoupons = [];
    }

    return {
      cartItems,
      shippingMethods,
      activeCoupons,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching checkout data:', error);
    
    // Return fallback data
    return {
      cartItems: [],
      shippingMethods: [{
        id: 1,
        name: 'Standard Shipping',
        price: 9.99,
        description: '5-7 business days',
        details: 'Standard delivery service with tracking included.',
        estimated_delivery: '5-7 business days',
        tracking_available: true
      }],
      activeCoupons: [],
      error: 'Failed to fetch checkout data',
      timestamp: new Date().toISOString()
    };
  }
};

// Authentication functions
export const loginUser = async (email, password) => {
  const response = await fetchAPI('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.error) {
    return response; // Return error response instead of throwing
  }

  // Store tokens in localStorage
  if (response.access && response.refresh) {
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    // Store user info if available
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }

  return response;
};

export const signupUser = async (userData) => {
  const response = await fetchAPI('/api/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (response.error) {
    return response; // Return error response instead of throwing
  }

  // Store user info if available (registration doesn't return tokens by default)
  if (response.user) {
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  return response;
};