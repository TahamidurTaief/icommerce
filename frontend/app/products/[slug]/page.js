import { notFound } from "next/navigation";
import ProductDetailPageClient from "@/app/Components/Product/ProductDetailPageClient";
import { Suspense } from "react";
import Loading from "./loading";

// Revalidate product pages every 60s (ISR-like behavior in App Router)
export const revalidate = 60;

// Generate no static params; handle dynamically at request time (blocking-like)
export async function generateStaticParams() {
  return [];
}

// Helper to fetch a single product with proper base URL and revalidate
async function fetchProductBySlug(slug) {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const url = `${base}/api/products/${slug}/`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`Failed to fetch product ${slug}:`, res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Network/API error fetching product:', err);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const plainDescription = product.description ? product.description.replace(/<[^>]*>?/gm, '') : '';
  return {
    title: `${product.name} | ICommerce`,
    description: plainDescription.substring(0, 160),
  };
}

// Main page component
export default async function ProductDetailPage({ params }) {
  const { slug } = params;
  const product = await fetchProductBySlug(slug);
  if (!product || !product.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-[var(--color-background)] text-foreground min-h-[calc(100vh-126px)] overflow-auto">
      <Suspense fallback={<Loading />}>
        <ProductDetailPageClient product={product} />
      </Suspense>
    </div>
  );
}
