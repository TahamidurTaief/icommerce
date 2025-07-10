import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const CategoryCard = ({ id, title, images, total_products, sub_categories }) => {
    return (
        <div key={id} className="bg-[var(--color-surface)] !rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-2">
                <Link href={`/category/${id}`}>
                    <div className="flex flex-col justify-between items-start mb-3">
                        <h3 className="text-md font-bold poppins text-[var(--color-text-primary)] hover:text-sky-500 duration-200">{title}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] hover:text-sky-500 duration-200">Total products <strong>{total_products}+</strong></p>
                    </div>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                    {images.slice(0, 3).map((img, index) => (
                        <div key={index} className="relative aspect-square !rounded-lg overflow-hidden">
                            <Image
                                src={img}
                                alt={`${title} ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                    
                    {/* Last image with overlay */}
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                        {images[3] && (
                            <Image
                                src={images[3]}
                                alt={`${title} 4`}
                                fill
                                className="object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-end justify-end p-2">
                            <span className="text-white font-bold text-2xl raleway">
                                {sub_categories}+
                            </span>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default CategoryCard