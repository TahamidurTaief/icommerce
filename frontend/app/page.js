// frontend/app/page.js
import HomePage from "@/app/Components/Home/HomePage";
import { getProducts, getCategories } from "@/app/lib/services"; // নতুন সার্ভিস ইম্পোর্ট করুন

export default async function Home() {
  // হোম পেজের জন্য ১২টি প্রোডাক্ট এবং সকল ক্যাটেগরি সার্ভার থেকে আনা হচ্ছে
  const products = await getProducts({ page_size: 12 });
  const categories = await getCategories();
  
  return (
    <div>
      <HomePage products={products} categories={categories} />
    </div>
  );
}
