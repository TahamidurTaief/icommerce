import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const AllCategoryComponents = ({ id, title, icon, isSelected, onClick }) => {
    return (
        <div>
            <button 
                onClick={onClick}
                className={`group w-full ${isSelected ? 'bg-sky-500 text-white' : 'border border-blue-500 text-white hover:border-blue-500 hover:bg-sky-500'} rounded-full transition-colors duration-200`}
            >
                <div className="flex flex-row gap-2 items-center px-1 py-1">
                    <div className="relative rounded-full aspect-square h-7 w-7 overflow-hidden">
                        <Image
                            src={icon}
                            alt={title}
                            className="object-cover rounded-full w-full h-full group-hover:scale-105 transition-transform"
                            placeholder="blur"
                        />
                    </div>
                    <div>
                        <h3 className={`font-medium text-sm lato ${isSelected ? 'text-white' : 'dark:text-white text-blue-500 hover:text-white'}`}>
                            {title}
                        </h3>
                    </div>
                </div>
            </button>
        </div>
    )
}

export default AllCategoryComponents