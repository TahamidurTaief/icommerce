"use client";
import { Star, Check } from "lucide-react";

// This component displays the core product details, including name, price, rating,
// and variant selectors (color, size).
export default function ProductInfo({ product, selectedColor, setSelectedColor, selectedSize, setSelectedSize }) {
  const price = parseFloat(product.discount_price) || parseFloat(product.price) || 0;
  const originalPrice = parseFloat(product.price) || 0;
  const rating = product.rating || 4.5; // Default rating if none provided
  const reviewCount = product.review_count || 0;

  // Function to smoothly scroll to the reviews tab
  const scrollToReviews = (e) => {
    e.preventDefault();
    const tabsElement = document.getElementById('product-tabs');
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: 'smooth' });
      // Optionally, you could also programmatically click the reviews tab here
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Breadcrumbs for navigation context */}
      <nav className="text-sm lato text-[var(--color-text-secondary)]">
        <span>Home / </span>
        <span>{product.sub_category?.category?.name || 'Product'} / </span>
        <span className="text-[var(--color-text-primary)] lato font-medium">{product.name}</span>
      </nav>
      
      {/* Main product title */}
      <h1 className="text-xl lg:text-3xl font-semibold text-[var(--color-foreground)] leading-tight">{product.name}</h1>

      {/* Rating and Shop Info */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={i < Math.round(rating) ? "fill-current" : "text-gray-300"} />
          ))}
          <span className="text-muted-foreground ml-1">({reviewCount} reviews)</span>
        </div>
        <div className="h-4 border-l border-border"></div>
        <span className="text-muted-foreground">Shop: <span className="font-medium text-primary">{product.shop?.name}</span></span>
      </div>

      {/* Pricing section */}
      <div className="flex items-baseline gap-3 pt-2">
        <span className="text-4xl font-bold text-primary">${price.toFixed(2)}</span>
        {product.discount_price && (
          <span className="text-xl text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
        )}
      </div>

      {/* Short description */}
      <p className="text-muted-foreground text-base leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />

      <div className="border-t border-border my-4"></div>

      {/* Color Selector */}
      {product.colors?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Color: <span className="font-normal text-muted-foreground">{selectedColor?.name || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button 
                key={color.id} 
                onClick={() => setSelectedColor(color)} 
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center
                  ${selectedColor?.id === color.id 
                    ? 'ring-1 ring-offset-2 ring-primary border-transparent' 
                    : 'border-border hover:border-primary/50'
                  }`} 
                style={{ backgroundColor: color.hex_code }} 
                title={color.name}
              >
                {selectedColor?.id === color.id && <Check size={20} className="text-white mix-blend-difference" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {product.sizes?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Size: <span className="font-normal text-muted-foreground">{selectedSize?.name || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button 
                key={size.id} 
                onClick={() => setSelectedSize(size)} 
                className={`px-3 py-1 rounded-sm lato border-2 font-medium transition-all text-base
                  ${selectedSize?.id === size.id 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-border bg-[var(--color-surface)] hover:bg-[var(--color-second-bg)] hover:border-primary/50'
                  }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
