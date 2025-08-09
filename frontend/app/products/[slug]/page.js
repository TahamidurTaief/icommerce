import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/lib/api";
import ProductDetailPageClient from "@/app/Components/Product/ProductDetailPageClient";
import { Suspense } from "react";
import Loading from "./loading";

// Force static generation for all possible product slugs
export async function generateStaticParams() {
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const product = await getProductBySlug(slug);
    if (!product || product.error) {
      return { title: "Product Not Found" };
    }
    const plainDescription = product.description ? product.description.replace(/<[^>]*>?/gm, '') : '';
    return {
      title: `${product.name} | ICommerce`,
      description: plainDescription.substring(0, 160),
    };
  } catch (error) {
    return { title: "Product Not Found" };
  }
}

// Main page component
export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  
  try {
    const product = await getProductBySlug(slug);
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
  } catch (error) {
    notFound();
  }
}
