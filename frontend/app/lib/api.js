// frontend/app/lib/api.js
import { cache } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * A robust, reusable function for making API requests.
 * Includes basic retry logic for network or server errors.
 * @param {string} endpoint - The API endpoint to call (e.g., '/api/products/').
 * @param {object} options - Standard fetch options.
 * @param {number} retries - Number of retry attempts.
 * @returns {Promise<object|null>} - The JSON response from the API.
 */
export async function fetchAPI(endpoint, options = {}, retries = 3) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      cache: 'no-store', // Ensures fresh data for dynamic content like products
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (retries > 0 && response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        return fetchAPI(endpoint, options, retries - 1);
      }
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    if (response.status === 204) return null; // Handle No Content response
    return await response.json();
  } catch (error) {
    console.error("Fetch API failed:", error);
    // Return a consistent error shape to prevent app crashes
    return { error: error.message, results: [], count: 0 };
  }
}

/**
 * Fetches all product categories. Cached for performance.
 */
export const getCategories = cache(async () => {
  return fetchAPI('/api/categories/', { next: { revalidate: 3600 } }); // Revalidate every hour
});

/**
 * Fetches all shops to be used as "Brands". Cached for performance.
 */
export const getShops = cache(async () => {
  return fetchAPI('/api/shops/', { next: { revalidate: 3600 } });
});

/**
 * Fetches all unique color values. Cached for performance.
 */
export const getColors = cache(async () => {
  return fetchAPI('/api/colors/', { next: { revalidate: 3600 } });
});

/**
 * Fetches products based on specified filters and page number.
 * @param {object} filters - The filter object from the UI state.
 * @param {number} page - The page number to fetch.
 * @returns {Promise<object>} - A paginated response object with { count, next, previous, results }.
 */
export const getProducts = async (filters = {}, page = 1) => {
  const params = new URLSearchParams();

  params.append('page', page);

  if (filters.category) {
    params.append('category', filters.category);
  }
  if (filters.brands && filters.brands.length > 0) {
    params.append('brands', filters.brands.join(','));
  }
  if (filters.colors && filters.colors.length > 0) {
    // The backend filter expects the color name (e.g., 'Red'), not the id ('red').
    params.append('colors', filters.colors.join(','));
  }
  if (filters.priceRange) {
    params.append('min_price', filters.priceRange[0]);
    params.append('max_price', filters.priceRange[1]);
  }
  if (filters.sort) {
    const sortMapping = {
      'price-asc': 'price',
      'price-desc': '-price',
      'name-asc': 'name',
      'name-desc': '-name',
      'featured': '-created_at',
    };
    if (sortMapping[filters.sort]) {
      params.append('ordering', sortMapping[filters.sort]);
    }
  }

  const queryString = params.toString();
  const endpoint = `/api/products/?${queryString}`;
  
  return fetchAPI(endpoint);
};


  export const getInitialHomeProducts = cache(async () => {
      return fetchAPI('/api/products/?limit=12');
  });
