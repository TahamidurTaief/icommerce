import HomePage from "@/app/Components/Home/HomePage";
import { getInitialHomeProducts, getCategories } from "@/app/lib/services";

export default async function Home() {
  // Fetch initial data on the server for the first page load
  const initialProductsData = await getInitialHomeProducts();
  const categoriesData = await getCategories();

  // Extract the 'results' array or default to an empty array
  const initialProducts = initialProductsData?.results || [];
  const categories = categoriesData || [];

  return (
    <div>
      <HomePage 
        initialProducts={initialProducts} 
        categories={categories} 
      />
    </div>
  );
}
