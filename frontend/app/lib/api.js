// app/lib/api.js
import { cache } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchAPI(endpoint, options = {}, retries = 3) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (retries > 0 && response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchAPI(endpoint, options, retries - 1);
      }
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error("Fetch API failed:", error);
    return { error: error.message, results: [], count: 0 };
  }
}

export const getCategories = cache(async () => {
  return fetchAPI('/api/categories/', { next: { revalidate: 3600 } });
});

export const getShops = cache(async () => {
  return fetchAPI('/api/shops/', { next: { revalidate: 3600 } });
});

export const getColors = cache(async () => {
  return fetchAPI('/api/colors/', { next: { revalidate: 3600 } });
});

export const getProducts = async (filters = {}, page = 1) => {
  const params = new URLSearchParams({ page });

  if (filters.category) params.append('category', filters.category);
  if (filters.brands?.length) params.append('brands', filters.brands.join(','));
  if (filters.colors?.length) params.append('colors', filters.colors.join(','));
  if (filters.priceRange) {
    params.append('min_price', filters.priceRange[0]);
    params.append('max_price', filters.priceRange[1]);
  }
  if (filters.sort) {
    const sortMapping = {
      'price-asc': 'price', 'price-desc': '-price',
      'name-asc': 'name', 'name-desc': '-name',
      'featured': '-created_at',
    };
    if (sortMapping[filters.sort]) params.append('ordering', sortMapping[filters.sort]);
  }

  return fetchAPI(`/api/products/?${params.toString()}`);
};

export const getProductBySlug = cache(async (slug) => {
  if (!slug) return null;
  return fetchAPI(`/api/products/${slug}/`);
});

  export const getInitialHomeProducts = cache(async () => {
      return fetchAPI('/api/products/?limit=12');
  });
