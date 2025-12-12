import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";

interface CategoriesSectionProps {
  categories: string[];
  currentCategory?: string;
}

const CategoriesSection = ({ categories, currentCategory }: CategoriesSectionProps) => {
  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      {categories?.map((category, idx) => (
        <Link
          key={idx}
          href={`/shop?category=${encodeURIComponent(category)}`}
          className={cn([
            "flex items-center justify-between py-2 hover:text-black transition-colors",
            currentCategory === category && "text-black font-medium"
          ])}
        >
          {category} <MdKeyboardArrowRight />
        </Link>
      ))}
    </div>
  );
};

export default CategoriesSection;
