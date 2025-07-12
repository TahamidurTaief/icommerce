// app/products/[slug]/page.js

import ProductDetailPageClient from "@/app/Components/Product/ProductDetailPageClient";
import { ProductsData } from "@/app/lib/Data/ProductsData";
import { notFound } from "next/navigation";

// Helper function to fetch product (Server Side)
async function getProduct(slug) {
  const product = ProductsData.find((p) => p.slug === slug);
  return product || null;
}

// Utility to serialize imported images for client components
const serializeProduct = (prod) => {
  if (!prod) return null;
  return {
    ...prod,
    // Ensure image paths are strings for client side consumption
    imageUrl: prod.imageUrl?.src ? prod.imageUrl.src : prod.imageUrl,
    additionalImages:
      prod.additionalImages?.map((img) => (img.src ? img.src : img)) || [],
  };
};

export default async function ProductDetailPage({ params }) {
  const { slug } = params;
  const product = await getProduct(slug);

  if (!product) {
    notFound(); // Show 404 if product not found
  }

  const serializedProduct = serializeProduct(product);

  return (
    // Modern UI layout using max-w-screen-xl
    <div className="container mx-auto px-4 py-8 md:py-12 bg-[var(--color-background)] text-foreground min-h-[calc(100vh-126px)] overflow-auto">
      <ProductDetailPageClient product={serializedProduct} />
    </div>
  );
}
