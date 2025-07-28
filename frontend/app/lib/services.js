// frontend/app/lib/services.js
// এই ফাইলটি API থেকে ডেটা আনার জন্য কেন্দ্রীয় হাব হিসেবে কাজ করবে

import { cache } from 'react';

// API এর বেস URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Django API থেকে ডেটা আনার জন্য একটি জেনেরিক ফাংশন।
 * @param {string} endpoint - API এন্ডপয়েন্ট (e.g., '/api/products/').
 * @param {object} options - অতিরিক্ত fetch অপশন।
 * @returns {Promise<any>} - API থেকে প্রাপ্ত JSON ডেটা।
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store', // ডিফল্টভাবে ক্যাশ করা হবে না
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error for ${endpoint}: ${response.status}`, errorText);
      throw new Error(`API call failed for ${endpoint}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error: ${error.message}`);
    return null; // সমস্যা হলে null রিটার্ন করবে
  }
}

/**
 * প্রোডাক্ট ডেটা আনার ফাংশন।
 * @param {object} params - কুয়েরি প্যারামিটার (e.g., { page_size: 12 }).
 */
export const getProducts = cache(async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const data = await fetchAPI(`/api/products/?${query}`);
  // পেজিনেশন করা রেসপন্স থেকে শুধুমাত্র প্রোডাক্টের তালিকা রিটার্ন করা হচ্ছে
  return data?.results || []; 
});

/**
 * ক্যাটেগরি ডেটা আনার ফাংশন।
 */
export const getCategories = cache(async () => {
  // ক্যাটেগরি খুব বেশি পরিবর্তন হয় না, তাই এক ঘণ্টার জন্য ক্যাশ করা হলো
  return fetchAPI('/api/categories/', { next: { revalidate: 3600 } });
});

