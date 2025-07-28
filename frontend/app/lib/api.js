// frontend/app/lib/api.js
import { cache } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store',
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error Response for ${endpoint}:`, errorData);
      throw new Error(`API call failed for endpoint: ${endpoint} with status: ${response.status}`);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Fetch Exception: ${error.message}`);
    return null; 
  }
}

export const getCategories = cache(async () => {
  return fetchAPI('/api/categories/', { next: { revalidate: 3600 } });
});

export const getProducts = async (searchParams = {}) => {
  const params = new URLSearchParams();

  // BUG FIX: The key for category filtering is 'category', not 'sub_category__category__slug'
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
  
  // No-store cache for dynamic product fetching
  return fetchAPI(endpoint, { cache: 'no-store' });
};

// This initial fetch is for the server-side render of the home page
export const getInitialHomeProducts = cache(async () => {
    return fetchAPI('/api/products/?limit=12');
});
