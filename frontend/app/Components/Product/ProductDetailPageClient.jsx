"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { getShippingMethods } from "@/app/lib/api";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import PaymentDetails from "./PaymentDetails";
import ProductTabs from "./ProductTabs";

export default function ProductDetailPageClient({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [isInCart, setIsInCart] = useState(false);

  // Effect to check if the current product variant is in the cart
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const itemInCart = cartItems.find(item =>
        item.id === product.id &&
        item.selectedColor?.id === selectedColor?.id &&
        item.selectedSize?.id === selectedSize?.id
      );
      setIsInCart(!!itemInCart);
    }
  }, [product.id, selectedColor, selectedSize]);

  useEffect(() => {
    getShippingMethods().then(data => {
      if (Array.isArray(data)) {
        setShippingMethods(data);
        if (data.length > 0) setSelectedShipping(data[0]);
      }
    });
  }, []);

  const calculations = useMemo(() => {
    const price = parseFloat(product.discount_price) || parseFloat(product.price) || 0;
    const subtotal = price * quantity;
    const shippingCost = selectedShipping ? parseFloat(selectedShipping.price) : 0;
    const total = subtotal + shippingCost;
    return { subtotal, shippingCost, total };
  }, [quantity, product, selectedShipping]);

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    const newItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.discount_price) || parseFloat(product.price),
        quantity: quantity,
        thumbnail_url: product.thumbnail_url,
        selectedColor: selectedColor,
        selectedSize: selectedSize,
    };

    const updatedCart = [...cartItems, newItem];
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    setIsInCart(true);
    toast.success("Product added to cart!");
  };

  const handleRemoveFromCart = () => {
    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    const updatedCart = cartItems.filter(item => 
        !(item.id === product.id && 
          item.selectedColor?.id === selectedColor?.id && 
          item.selectedSize?.id === selectedSize?.id)
    );

    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    setIsInCart(false);
    toast.error("Product removed from cart.");
  };

  const allImages = [product.thumbnail_url, ...(product.additional_images?.map(img => img.image) || [])].filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-4"><ImageGallery images={allImages} productName={product.name} /></div>
      <div className="lg:col-span-4"><ProductInfo product={product} selectedColor={selectedColor} setSelectedColor={setSelectedColor} selectedSize={selectedSize} setSelectedSize={setSelectedSize} /></div>
      <div className="lg:col-span-4">
        <PaymentDetails 
          product={product} 
          quantity={quantity} 
          setQuantity={setQuantity} 
          calculations={calculations} 
          shippingMethods={shippingMethods} 
          selectedShipping={selectedShipping} 
          setSelectedShipping={setSelectedShipping} 
          isInCart={isInCart}
          handleAddToCart={handleAddToCart}
          handleRemoveFromCart={handleRemoveFromCart}
        />
      </div>
      <div className="lg:col-span-8"><ProductTabs product={product} /></div>
    </div>
  );
}