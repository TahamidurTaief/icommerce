  // frontend/app/lib/services.js
  import { cache } from 'react';

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  /**
   * Generic API fetcher function.
   * @param {string} endpoint - The API endpoint to call.
   * @param {object} options - Fetch options.
   * @returns {Promise<any>} - The JSON response from the API.
   */
  export async function fetchAPI(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        // Default to no-store unless specified otherwise.
        cache: 'no-store',
        ...options,
      });

      if (!response.ok) {
        // For client-side debugging, log the detailed error
        if (typeof window !== 'undefined') {
          console.error(`API Error Response for ${endpoint}:`, await response.text());
        }
        throw new Error(`API call failed for endpoint: ${endpoint} with status: ${response.status}`);
      }
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      // This will catch network errors (like "Failed to fetch") and errors thrown above.
      console.error(`API Fetch Exception: ${error.message}`);
      // Return a structured error or null to be handled by the caller.
      return { error: error.message, data: null };
    }
  }

  /**
   * Fetches all product categories.
   * Cached for one hour as they change infrequently.
   */
  export const getCategories = cache(async () => {
    return fetchAPI('/api/categories/', { next: { revalidate: 3600 } });
  });

  /**
   * Fetches products based on search/filter parameters.
   * This function is used for dynamic, client-side filtering.
   * @param {object} searchParams - The filter parameters.
   */
  export const getProducts = async (searchParams = {}) => {
    const params = new URLSearchParams();

    if (searchParams.category) {
      params.append('category', searchParams.category);
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
    const endpoint = `/api/products/?${queryString}`;
    
    return fetchAPI(endpoint);
  };

  /**
   * Fetches the initial set of products for the home page (server-side).
   * Fetches only the first 12 products.
   */
  export const getInitialHomeProducts = cache(async () => {
      return fetchAPI('/api/products/?limit=12');
  });
