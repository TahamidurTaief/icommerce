// ===================================================================
// app/Components/Product/ProductInfo.jsx

"use client";
import { LuHeart } from "react-icons/lu";

export default function ProductInfo({ product, selectedColor, setSelectedColor, selectedSize, setSelectedSize }) {
  const price = parseFloat(product.discount_price) || parseFloat(product.price) || 0;
  const originalPrice = parseFloat(product.price) || 0;
  const inStock = product.stock > 0 && product.is_active;

  return (
    <div className="bg-[var(--color-second-bg)] p-6 rounded-lg shadow-md h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <div className="flex items-baseline gap-3 mb-6"><span className="text-3xl font-bold text-primary">${price.toFixed(2)}</span>{product.discount_price && <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>}</div>
      
      {product.colors?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Color: <span className="font-normal text-muted-foreground">{selectedColor?.name || 'Select a color'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button key={color.id} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.id === color.id ? 'ring-4 ring-offset-2 ring-primary' : 'border-border'}`} style={{ backgroundColor: color.hex_code }} title={color.name} />
            ))}
          </div>
        </div>
      )}

      {product.sizes?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Size: <span className="font-normal text-muted-foreground">{selectedSize?.name || 'Select a size'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button key={size.id} onClick={() => setSelectedSize(size)} className={`px-5 py-2 rounded-lg border-2 font-medium transition-all ${selectedSize?.id === size.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>{size.name}</button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-6 border-t text-sm"><p><span className="font-semibold">Shop:</span> {product.shop?.name}</p><p><span className="font-semibold">Availability:</span> {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}</p></div>
    </div>
  );
}