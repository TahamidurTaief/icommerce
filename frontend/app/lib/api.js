// app/lib/api.js
import { cache } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  return {};
};

async function fetchAPI(endpoint, options = {}) {
  const headers = { 
    'Content-Type': 'application/json', 
    ...getAuthHeaders(),
    ...options.headers 
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
      ...options, 
      headers, 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        // Log the detailed error from the backend if available
        console.error("Backend Error:", errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.detail}`);
    }
    return response.status === 204 ? null : await response.json();
  } catch (error) {
    console.error("Fetch API failed:", endpoint, error);
    return { error: error.message };
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
export const getShippingMethods = cache(async () => fetchAPI('/api/shipping-methods/'));

// Order fetches (requires authentication)
export const getUserOrders = async () => fetchAPI('/api/orders/');
export const getOrderDetails = async (orderNumber) => fetchAPI(`/api/orders/${orderNumber}/`);

// Order creation with payment info
export const createOrderWithPayment = async (orderData) => {
  return fetchAPI('/api/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    const response = await fetchAPI('/api/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    // Store tokens in localStorage
    if (response.access && response.refresh) {
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
    }

    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const signupUser = async (userData) => {
  try {
    const response = await fetchAPI('/api/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    // Store tokens in localStorage if they're returned
    if (response.access && response.refresh) {
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
    }

    return response;
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
};