import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FiSliders } from "react-icons/fi";
import Filters from ".";
import { getUniqueCategories, getUniqueDepartments, getUniqueColors, ProductFilters } from "@/app/actions/product-actions";
import { ShopPageProps } from "@/app/shop/page";

const MobileFilters = async ({ searchParams }: ShopPageProps) => {
  // Build filters from search params
  const filters: ProductFilters = {};

  if (searchParams.category) {
    filters.category = searchParams.category;
  }

  if (searchParams.department) {
    filters.department = searchParams.department;
  }

  if (searchParams.colors) {
    filters.colors = searchParams.colors.split(',');
  }

  if (searchParams.minPrice) {
    filters.minPrice = Number(searchParams.minPrice);
  }

  if (searchParams.maxPrice) {
    filters.maxPrice = Number(searchParams.maxPrice);
  }

  if (searchParams.productType) {
    filters.productType = searchParams.productType;
  }

  if (searchParams.search) {
    filters.searchQuery = searchParams.search;
  }

  // Fetch filter options
  const [categories, departments, colors] = await Promise.all([
    getUniqueCategories(),
    getUniqueDepartments(),
    getUniqueColors(),
  ]);

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-[#F0F0F0] text-black p-1 md:hidden"
          >
            <FiSliders className="text-base mx-auto" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90%]">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <DrawerTitle className="hidden">filters</DrawerTitle>
            <DrawerDescription className="hidden">filters</DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[90%] overflow-y-auto w-full px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <Filters categories={categories} departments={departments} colors={colors} currentFilters={filters} searchParams={searchParams} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileFilters;
