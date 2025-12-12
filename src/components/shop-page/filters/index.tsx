import React from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import ColorsSection from "@/components/shop-page/filters/ColorsSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import SizeSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/app/actions/product-actions";

interface FiltersProps {
  categories: string[];
  departments: string[];
  colors: string[];
  currentFilters: ProductFilters;
  searchParams: Record<string, string | undefined>;
}

const Filters = ({ categories, departments, colors, currentFilters, searchParams }: FiltersProps) => {
  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection categories={categories} currentCategory={currentFilters?.category} />
      <hr className="border-t-black/10" />
      <PriceSection currentFilters={currentFilters} searchParams={searchParams} />
      <hr className="border-t-black/10" />
      <ColorsSection colors={colors} currentColors={currentFilters?.colors} searchParams={searchParams} />
      <hr className="border-t-black/10" />
      {/* <SizeSection /> */}
      {/* <hr className="border-t-black/10" /> */}
      {/* <DressStyleSection /> */}
    </>
  );
};

export default Filters;
