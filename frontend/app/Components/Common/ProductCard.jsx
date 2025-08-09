"use client";

import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart, LuEye } from "react-icons/lu";
import { FiX } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/app/contexts/ModalContext";

const ProductCard = ({ productData }) => {
  const { showModal } = useModal();
  
  const colors = productData?.colors || [];
  const sizes = productData?.sizes || [];

  const originalPrice = parseFloat(productData?.price || 0);
  const price = parseFloat(productData?.discount_price || productData?.price || 0);
  
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const inStock = productData?.stock > 0;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes?.[0] || null);
  
  const allImages = [productData?.thumbnail_url, ...(productData?.additional_images?.map(img => img.image) || [])].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(allImages[0]); 

  const productUrl = `/products/${productData?.slug}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    
    showModal({
        status: 'success',
        title: 'Added to Cart!',
        message: `${productData.name} has been successfully added to your cart.`,
        primaryActionText: 'View Cart',
        onPrimaryAction: () => { window.location.href = '/cart'; },
        secondaryActionText: 'Continue Shopping'
    });
    closeQuickView();
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    showModal({
      status: 'success',
      title: !isWishlisted ? 'Added to Wishlist' : 'Removed from Wishlist',
      message: !isWishlisted ? `${productData?.name} added to wishlist!` : `${productData?.name} removed from wishlist!`,
      primaryActionText: 'Continue Shopping'
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const closeQuickView = () => setQuickViewOpen(false);
  
  const placeholderImg = 'https://placehold.co/500x500/e2e8f0/e2e8f0.png?text=img';

  return (
    <>
      <Link href={productUrl} passHref className="h-full">
        <motion.div
          className="group relative bg-[var(--color-surface)] p-3 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border h-full flex flex-col"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
            {discount > 0 && <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">-{discount}%</div>}
            <Image
              src={productData?.thumbnail_url || placeholderImg}
              alt={productData?.name || 'Product Image'}
              fill
              className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={(e) => { e.currentTarget.src = placeholderImg; }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
              {[
                { icon: LuEye, action: handleQuickView, label: "Quick View" },
                { icon: LuHeart, action: handleAddToWishlist, label: "Wishlist", active: isWishlisted },
                { icon: LuShoppingCart, action: handleAddToCart, label: "Add to Cart", disabled: !inStock },
              ].map((item, index) => (
                <motion.button
                  key={index}
                  onClick={item.action}
                  disabled={item.disabled}
                  className={`p-3 rounded-full shadow-lg transition-all duration-200 ${item.active ? "bg-red-500 text-white" : "bg-white/90 text-gray-800 hover:bg-white"} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  aria-label={item.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={`text-lg ${item.active ? 'fill-current' : ''}`} />
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{productData?.sub_category?.name || 'Category'}</span>
            <h3 className="font-semibold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{productData?.name}</h3>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-xl font-bold text-foreground">${price?.toFixed(2)}</span>
              {originalPrice > price && <span className="text-sm text-muted-foreground line-through">${originalPrice?.toFixed(2)}</span>}
            </div>
          </div>
        </motion.div>
      </Link>

      <AnimatePresence>
        {quickViewOpen && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeQuickView}>
            <motion.div className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col md:flex-row" initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.95 }} transition={{ type: "spring", damping: 20, stiffness: 200 }} onClick={(e) => e.stopPropagation()}>
              <button onClick={closeQuickView} className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm p-2 rounded-full z-20 hover:bg-background/80 transition-colors" aria-label="Close quick view"><FiX /></button>
              <div className="w-full md:w-1/2 p-4">
                <div className="relative aspect-square mb-3 rounded-xl overflow-hidden"><Image src={selectedImage || placeholderImg} alt={productData?.name || 'Product Image'} fill className="object-cover" onError={(e) => { e.currentTarget.src = placeholderImg; }}/></div>
                <div className="flex gap-2 justify-center">{allImages.map((img, idx) => (<button key={idx} onClick={() => setSelectedImage(img)} className={`relative h-14 w-14 rounded-md overflow-hidden border-2 transition-all ${selectedImage === img ? "border-primary" : "border-transparent hover:border-border"}`}><Image src={img || placeholderImg} alt={`Thumb ${idx + 1}`} fill className="object-cover" onError={(e) => { e.currentTarget.src = placeholderImg; }}/></button>))}</div>
              </div>
              <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                <h2 className="text-2xl font-bold text-foreground mb-2">{productData?.name}</h2>
                <div className="flex items-baseline gap-3 mb-4"><span className="text-2xl font-bold text-primary">${price?.toFixed(2)}</span>{originalPrice > price && <span className="text-base text-muted-foreground line-through">${originalPrice?.toFixed(2)}</span>}</div>
                <p className="text-muted-foreground mb-6 text-sm line-clamp-3">{productData?.description.replace(/<[^>]*>?/gm, '')}</p>
                {colors?.length > 0 && (<div className="mb-4"><h4 className="font-medium mb-2 text-foreground">Color:</h4><div className="flex gap-2">{colors.map((color) => (<button key={color.id} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor?.id === color.id ? "ring-2 ring-offset-1 ring-primary" : "border-border"}`} style={{ backgroundColor: color.hex_code }} />))}</div></div>)}
                {sizes?.length > 0 && (<div className="mb-6"><h4 className="font-medium mb-2 text-foreground">Size:</h4><div className="flex gap-2 flex-wrap">{sizes.map((size) => (<button key={size.id} onClick={() => setSelectedSize(size)} className={`px-3 py-1.5 text-sm rounded-md border ${selectedSize?.id === size.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>{size.name}</button>))}</div></div>)}
                <div className="mt-auto pt-6 border-t border-border"><button onClick={handleAddToCart} disabled={!inStock} className="w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"><LuShoppingCart /> {inStock ? "Add to Cart" : "Out of Stock"}</button><Link href={productUrl} className="block text-center mt-3 text-sm text-primary hover:underline">View Full Details</Link></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
