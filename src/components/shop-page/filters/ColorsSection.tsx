"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdCheckmark } from "react-icons/io";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Color mapping for product colors to hex codes
const colorMap: Record<string, string> = {
  "Bluish Green": "bg-[#1B9C86]",
  "Mole": "bg-[#6D5843]",
  "Brown": "bg-[#8B4513]",
  "Pink": "bg-[#E7A1C2]",
  "Red": "bg-[#C62828]",
  "White": "bg-white border-2 border-black/20",
  "Beige": "bg-[#DCC8A1]",
  "Turquoise": "bg-[#40E0D0]",
  "Orange": "bg-[#F28C28]",
  "Black": "bg-black",
  "Yellow": "bg-[#F2CB05]",
  "Grey": "bg-[#8F8F8F]",
  "Gray": "bg-[#8F8F8F]", // Alias for Grey
  "undefined": "bg-[#CCCCCC]",
  "Blue": "bg-[#1E5AAF]",
  "Lilac Purple": "bg-[#C8A2C8]",
  "Khaki green": "bg-[#7A8450]",
  "Metal": "bg-[#A9A9A9]",
  "Unknown": "bg-[#AAAAAA]",
  "Yellowish Green": "bg-[#9ACD32]",
  "Green": "bg-[#2E7D32]",
};

interface ColorsSectionProps {
  colors: string[];
  currentColors?: string[];
  searchParams: Record<string, string | undefined>;
}

const ColorsSection = ({ colors, currentColors = [], searchParams }: ColorsSectionProps) => {
  const router = useRouter();

  const handleColorToggle = (color: string) => {
    const params = new URLSearchParams();

    // Preserve existing params except colors and page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'colors' && key !== 'page') {
        params.set(key, value);
      }
    });

    // Toggle color selection
    let newColors: string[];
    if (currentColors.includes(color)) {
      newColors = currentColors.filter(c => c !== color);
    } else {
      newColors = [...currentColors, color];
    }

    if (newColors.length > 0) {
      params.set('colors', newColors.join(','));
    }

    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : '/shop');
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-colors">
      <AccordionItem value="filter-colors" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Colors
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex space-2.5 flex-wrap md:grid grid-cols-5 gap-2.5">
            {colors?.map((color, index) => {
              const isSelected = currentColors.includes(color);
              const colorClass = colorMap[color] || "bg-gray-400";

              return (
                <button
                  key={index}
                  type="button"
                  className={cn([
                    colorClass,
                    "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center border border-black/20 hover:scale-110 transition-transform",
                    isSelected && "ring-2 ring-black ring-offset-2"
                  ])}
                  onClick={() => handleColorToggle(color)}
                  title={color}
                >
                  {isSelected && (
                    <IoMdCheckmark className={cn([
                      "text-base",
                      ["White", "Beige", "Yellow", "Pink", "Lilac Purple", "Yellowish Green", "undefined", "Unknown", "Metal"].includes(color)
                        ? "text-gray-800"
                        : "text-white"
                    ])} />
                  )}
                </button>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ColorsSection;
