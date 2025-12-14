import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getProductsPaginated,
  getUniqueCategories,
  getUniqueColors,
  getUniqueDepartments,
  ProductFilters
} from "../actions/product-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ShopPageProps {
  searchParams: {
    page?: string;
    category?: string;
    department?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    productType?: string;
    search?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Get current page from URL params, default to 1
  const currentPage = Number(searchParams.page) || 1;
  const productsPerPage = 9;

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

  // Fetch paginated products with filters from MongoDB
  const { products, total, totalPages } = await getProductsPaginated(
    currentPage,
    productsPerPage,
    filters
  );

  // Fetch filter options
  const [categories, departments, colors] = await Promise.all([
    getUniqueCategories(),
    getUniqueDepartments(),
    getUniqueColors(),
  ]);

  // Calculate display range
  const startIndex = products.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * productsPerPage, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Helper to build URL with filters
  const buildUrl = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();

    // Preserve existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Apply new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();
    return queryString ? `/shop?${queryString}` : '/shop';
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Active Filters:</span>
            {filters.searchQuery && (
              <Link
                href={buildUrl({ search: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-black/80"
              >
                Search: {filters.searchQuery}
                <span className="text-lg">×</span>
              </Link>
            )}
            {filters.category && (
              <Link
                href={buildUrl({ category: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-black/80"
              >
                Category: {filters.category}
                <span className="text-lg">×</span>
              </Link>
            )}
            {filters.department && (
              <Link
                href={buildUrl({ department: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-black/80"
              >
                Department: {filters.department}
                <span className="text-lg">×</span>
              </Link>
            )}
            {filters.colors && filters.colors.map(color => (
              <Link
                key={color}
                href={buildUrl({
                  colors: filters.colors?.filter(c => c !== color).join(',') || undefined,
                  page: undefined
                })}
                className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-black/80"
              >
                {color}
                <span className="text-lg">×</span>
              </Link>
            ))}
            {(filters.minPrice || filters.maxPrice) && (
              <Link
                href={buildUrl({ minPrice: undefined, maxPrice: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-black/80"
              >
                Price: ₦{(filters.minPrice || 0).toLocaleString("en-US")} - ₦{(filters.maxPrice || 250).toLocaleString("en-US")}
                <span className="text-lg">×</span>
              </Link>
            )}
            <Link
              href="/shop"
              className="text-sm text-black/60 hover:text-black underline"
            >
              Clear All
            </Link>
          </div>
        )}

        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters
              categories={categories}
              departments={departments}
              colors={colors}
              currentFilters={filters}
              searchParams={searchParams}
            />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">
                  {filters.searchQuery
                    ? `Search results for "${filters.searchQuery}"`
                    : filters.category || filters.department || 'All Products'}
                </h1>
                <MobileFilters searchParams={searchParams} />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {startIndex}-{endIndex} of {total} Products
                </span>
                <div className="flex items-center">
                  Sort by:{" "}
                  <Select defaultValue="most-popular">
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Most Popular</SelectItem>
                      <SelectItem value="low-price">Low Price</SelectItem>
                      <SelectItem value="high-price">High Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-black/60 mb-4">No products found</p>
                <Link href="/shop" className="text-black underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <>
                <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} data={product} />
                  ))}
                </div>
                <hr className="border-t-black/10" />
                <Pagination className="justify-between">
                  <PaginationPrevious
                    href={currentPage > 1 ? buildUrl({ page: currentPage - 1 }) : "#"}
                    className={`border border-black/10 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }`}
                  />
                  <PaginationContent>
                    {pageNumbers.map((pageNum, index) => {
                      if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href={buildUrl({ page: pageNum })}
                            className="text-black/50 font-medium text-sm"
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  </PaginationContent>

                  <PaginationNext
                    href={
                      currentPage < totalPages ? buildUrl({ page: currentPage + 1 }) : "#"
                    }
                    className={`border border-black/10 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                      }`}
                  />
                </Pagination>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
