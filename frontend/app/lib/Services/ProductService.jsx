import { localProducts } from "../constants/data";

// Simulate API fetch with delay
const simulateAPIDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 300));

export const getProducts = async (filters = {}) => {
  await simulateAPIDelay();

  let results = [...localProducts];

  // Apply filters
  if (filters.category) {
    results = results.filter((p) => p.category === filters.category);
  }

  if (filters.priceRange) {
    results = results.filter(
      (p) =>
        p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );
  }

  // Apply sorting
  if (filters.sort) {
    switch (filters.sort) {
      case "price-asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
  }

  return results;
};

export const getProductBySlug = async (slug) => {
  await simulateAPIDelay();
  return localProducts.find((p) => p.slug === slug);
};

export const getFeaturedProducts = async () => {
  await simulateAPIDelay();
  return localProducts.slice(0, 8); // First 8 as featured
};
