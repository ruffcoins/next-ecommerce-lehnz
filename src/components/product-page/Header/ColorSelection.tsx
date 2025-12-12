"use client";

import {
  Color,
  setColorSelection,
  setSelectedVariation,
} from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import React from "react";
import { IoMdCheckmark } from "react-icons/io";
import { ProductVariation } from "@/types/product.types";

// Color mapping for product colors to hex codes
const colorMap: Record<string, string> = {
  "Bluish Green": "bg-[#1B9C86]",
  "Mole": "bg-[#6D5843]",
  "Brown": "bg-[#8B4513]",
  "Pink": "bg-[#E7A1C2]",
  "Red": "bg-[#C62828]",
  "White": "bg-white border border-gray-300",
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

interface ColorSelectionProps {
  colors?: string[];
  variations?: ProductVariation[];
}

const ColorSelection = ({ colors = [], variations = [] }: ColorSelectionProps) => {
  const { colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  // If no colors provided, don't render
  if (!colors || colors.length === 0) {
    return null;
  }

  // Create color objects from the available colors
  const colorsData: Color[] = colors.map(colorName => ({
    name: colorName,
    code: colorMap[colorName] || "bg-gray-400", // Fallback to gray if color not mapped
  }));

  const handleColorClick = (color: Color) => {
    // Update the color selection
    dispatch(setColorSelection(color));

    // Find the variation that matches this color
    const matchingVariation = variations.find(
      v => v.color_name === color.name
    );

    // Update the selected variation (which includes the price)
    if (matchingVariation) {
      dispatch(setSelectedVariation(matchingVariation));
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Select Colors
      </span>
      <div className="flex items-center flex-wrap gap-3 sm:gap-4">
        {colorsData.map((color, index) => (
          <button
            key={index}
            type="button"
            className={cn([
              color.code,
              "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center transition-all hover:scale-110",
            ])}
            onClick={() => handleColorClick(color)}
            title={color.name}
          >
            {colorSelection.name === color.name && (
              <IoMdCheckmark className={cn([
                "text-base",
                ["White", "Beige", "Yellow", "Pink", "Lilac Purple", "Yellowish Green", "undefined", "Unknown", "Metal"].includes(color.name)
                  ? "text-gray-800"
                  : "text-white"
              ])} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelection;
