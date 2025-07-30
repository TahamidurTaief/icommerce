// app/products/[slug]/page.js
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/lib/api";
import ProductDetailPageClient from "@/app/Components/Product/ProductDetailPageClient";
import { Suspense } from "react";
import Loading from "./loading"; // Import your existing loading component

/**
 * Generates metadata for the page dynamically based on the product.
 * This is a Next.js feature for SEO.
 * @param {{ params: { slug: string } }} props
 */
export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);

  // Handle cases where the product is not found or an API error occurs.
  if (!product || product.error) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist."
    };
  }

  // The description from the backend is HTML (from RichTextField).
  // We need to strip the HTML tags to create a clean meta description for SEO.
  const plainDescription = product.description ? product.description.replace(/<[^>]*>?/gm, '') : '';

  return {
    title: `${product.name} | ICommerce`,
    description: plainDescription.substring(0, 160), // Truncate for standard meta length
  };
}

/**
 * The main server component for the product detail page.
 * It fetches the product data and passes it to a client component for interactivity.
 * @param {{ params: { slug: string } }} props
 */
export default async function ProductDetailPage({ params }) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  // If the API returns an error or no product (check for a key like 'id'),
  // trigger the Next.js not-found page. This is a robust way to handle invalid slugs.
  if (!product || product.error || !product.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-[var(--color-background)] text-foreground min-h-[calc(100vh-126px)] overflow-auto">
      {/* Suspense boundary shows the loading.js component while data is being fetched */}
      <Suspense fallback={<Loading />}>
        {/* Pass the fetched product data to the client component for rendering */}
        <ProductDetailPageClient product={product} />
      </Suspense>
    </div>
  );
}
