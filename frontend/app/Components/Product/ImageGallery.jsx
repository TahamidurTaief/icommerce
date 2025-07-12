// components/Product/ImageGallery.jsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, productName }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg mb-4 bg-white">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/500x500/cccccc/000000?text=Image+Not+Found";
          }}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto p-2 w-full justify-center">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`relative w-16 h-16 md:w-20 md:h-20 min-w-[4rem] rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
              selectedImage === img
                ? "border-primary-600 ring-2 ring-primary-600"
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
