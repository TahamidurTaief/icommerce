"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import PaymentDetails from "./PaymentDetails";
import ProductTabs from "./ProductTabs";

// This component is the main client-side orchestrator for the product detail page.
// It manages all state and logic, passing props down to the display components.
export default function ProductDetailPageClient({ product }) {
  // State for selected product variants (color, size)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  
  // State for cart and quantity
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);

  // A unique ID for the product variant to manage cart state accurately
  const variantId = `${product.id}-${selectedColor?.id || 'c'}-${selectedSize?.id || 's'}`;

  // Effect to check if the current product variant is in the cart on load or when variants change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const itemInCart = cartItems.find(item => item.variantId === variantId);
      setIsInCart(!!itemInCart);
    }
  }, [variantId]);

  // Handler to add the selected product variant to the cart
  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    const newItem = {
        id: product.id,
        variantId: variantId,
        name: product.name,
        slug: product.slug,
        price: parseFloat(product.discount_price) || parseFloat(product.price),
        quantity: quantity,
        thumbnail_url: product.thumbnail_url,
        selectedColor: selectedColor,
        selectedSize: selectedSize,
    };

    const updatedCart = [...cartItems, newItem];
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    setIsInCart(true);
    toast.success(`${product.name} added to cart!`);
  };

  // Handler to remove the product variant from the cart
  const handleRemoveFromCart = () => {
    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    const updatedCart = cartItems.filter(item => item.variantId !== variantId);

    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    setIsInCart(false);
    toast.error(`${product.name} removed from cart.`);
  };
  
  // Memoize the list of all product images to prevent unnecessary recalculations
  const allImages = useMemo(() => 
    [product.thumbnail_url, ...(product.additional_images?.map(img => img.image) || [])].filter(Boolean),
    [product]
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      {/* Main product section with a 3-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <motion.div 
          className="lg:col-span-4"
          variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
        >
          <ImageGallery images={allImages} productName={product.name} />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-5"
          variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
        >
          <ProductInfo 
            product={product}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
          />
        </motion.div>

        <motion.div 
          className="lg:col-span-3"
          variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
        >
          <PaymentDetails
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
            isInCart={isInCart}
            handleAddToCart={handleAddToCart}
            handleRemoveFromCart={handleRemoveFromCart}
          />
        </motion.div>
      </div>

      {/* Product tabs section, appears below the main 3-column section */}
      <motion.div 
        className="mt-12 lg:mt-16"
        variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } } }}
      >
        <ProductTabs product={product} />
      </motion.div>
    </motion.div>
  );
}
