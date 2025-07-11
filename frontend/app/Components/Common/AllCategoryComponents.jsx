import React from "react";
import Image from "next/image";
import { Check } from "lucide-react"; // Assuming you're using Lucide icons

const AllCategoryComponents = ({ id, title, icon, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 border
        ${
          isSelected
            ? "border-[var(--color-primary)]"
            : "hover:bg-[var(--color-muted-bg)] hover:bg-opacity-30 border-transparent"
        }`}
      style={{
        backgroundColor: isSelected
          ? "rgba(var(--color-primary-rgb), 0.1)"
          : "transparent",
      }}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border)]">
        <Image src={icon} alt={title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-[var(--color-text-primary)] truncate">
          {title}
        </h3>
        {/* Optional: you can include description if available */}
        {/* <p className="text-xs text-[var(--color-text-secondary)] truncate">
          Some description
        </p> */}
      </div>
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          isSelected
            ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
            : "border-[var(--color-border)]"
        }`}
      >
        {isSelected && <Check size={12} className="text-white" />}
      </div>
    </div>
  );
};

export default AllCategoryComponents;
