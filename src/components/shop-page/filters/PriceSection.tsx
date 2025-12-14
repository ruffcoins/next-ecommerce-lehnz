"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { useRouter } from "next/navigation";
import { ProductFilters } from "@/app/actions/product-actions";

interface PriceSectionProps {
  currentFilters: ProductFilters;
  searchParams: Record<string, string | undefined>;
}

const PriceSection = ({ currentFilters, searchParams }: PriceSectionProps) => {
  const router = useRouter();
  const [priceRange, setPriceRange] = React.useState<number[]>([
    currentFilters?.minPrice || 20,
    currentFilters?.maxPrice || 200,
  ]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);

    // Build URL with new price filter
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'minPrice' && key !== 'maxPrice' && key !== 'page') {
        params.set(key, value);
      }
    });

    params.set('minPrice', values[0].toString());
    params.set('maxPrice', values[1].toString());

    router.push(`/shop?${params.toString()}`);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            min={20}
            max={200}
            step={5}
            label="₦"
          />
          <div className="mb-3" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
