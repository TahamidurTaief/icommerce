
// ===================================================================
// app/Components/Product/ImageGallery.jsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, productName }) {
  // ## BUG FIX START ##
  // Appended .png to the placeholder URL to request a PNG instead of an SVG.
  const placeholderImage = 'https://placehold.co/500x500/eee/ccc.png?text=No+Image';
  const [selectedImage, setSelectedImage] = useState(images[0] || placeholderImage);
  // ## BUG FIX END ##

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg mb-4 bg-white">
        <Image
          src={selectedImage}
          alt={productName || 'Product Image'}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
          onError={() => {
            // If an image fails to load, fall back to the placeholder
            setSelectedImage(placeholderImage);
          }}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto p-2 w-full justify-center">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`relative w-20 h-20 min-w-[5rem] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedImage === img
                ? "border-primary ring-2 ring-primary"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
