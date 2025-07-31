// app/products/[slug]/page.js
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/lib/api";
import ProductDetailPageClient from "@/app/Components/Product/ProductDetailPageClient";
import { Suspense } from "react";
import Loading from "./loading";

/**
 * Generates metadata for the page dynamically based on the product.
 * @param {{ params: { slug: string } }} props
 */
export async function generateMetadata({ params }) {
  // ## FIX: Directly use params.slug to avoid the Next.js warning ##
  const product = await getProductBySlug(params.slug);

  if (!product || product.error) {
    return { title: "Product Not Found" };
  }

  const plainDescription = product.description ? product.description.replace(/<[^>]*>?/gm, '') : '';

  return {
    title: `${product.name} | ICommerce`,
    description: plainDescription.substring(0, 160),
  };
}

/**
 * The main server component for the product detail page.
 * @param {{ params: { slug: string } }} props
 */
export default async function ProductDetailPage({ params }) {
  // ## FIX: Directly use params.slug to avoid the Next.js warning ##
  const product = await getProductBySlug(params.slug);

  if (!product || product.error || !product.id) {
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
