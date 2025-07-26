// frontend/app/lib/api.js
import { cache } from 'react';

// Use environment variable for the base API URL, defaulting to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * A generic function to fetch data from the Django API.
 * @param {string} endpoint The API endpoint to hit (e.g., '/api/products/').
 * @param {object} options Optional fetch options (e.g., next: { revalidate: 3600 }).
 * @returns {Promise<any>} The JSON response from the API.
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      // By default, do not cache. This can be overridden by options.
      cache: 'no-store',
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error Response for ${endpoint}:`, errorData);
      throw new Error(`API call failed for endpoint: ${endpoint} with status: ${response.status}`);
    }
    
    // Handle successful but empty responses (like a 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Fetch Exception: ${error.message}`);
    return null; // Return null on error to handle gracefully in components
  }
}

// --- Exported API Functions ---

// Use React 'cache' to deduplicate requests for the same data within a single render pass.
export const getCategories = cache(async () => {
  // Categories don't change often, so we can revalidate them periodically (e.g., every hour).
  return fetchAPI('/api/categories/', { next: { revalidate: 3600 } });
});

export const getMaxProductPrice = cache(async () => {
  // Max price might change, revalidate more often (e.g., every 10 minutes).
  return fetchAPI('/api/products/max-price/', { next: { revalidate: 600 } });
});

/**
 * Fetches products from the API based on search parameters.
 * @param {object} searchParams - An object representing the URL search parameters.
 */
export const getProducts = async (searchParams = {}) => {
  const params = new URLSearchParams();

  // Map frontend-friendly searchParams to backend API query params
  if (searchParams.category) {
    params.append('sub_category__category__slug', searchParams.category);
  }
  if (searchParams.min_price) {
    params.append('min_price', searchParams.min_price);
  }
  if (searchParams.max_price) {
    params.append('max_price', searchParams.max_price);
  }
  if (searchParams.ordering) {
    params.append('ordering', searchParams.ordering);
  }

  const queryString = params.toString();
  // Product data is dynamic, so we fetch it fresh on every request by default.
  return fetchAPI(`/api/products/?${queryString}`);
};

