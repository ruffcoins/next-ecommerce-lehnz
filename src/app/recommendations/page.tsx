import React from "react";
import { getRecommendedProducts } from "@/app/actions/product-actions";
import ProductCard from "@/components/common/ProductCard";
import Link from "next/link";
import { auth } from "@/auth";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface RecommendationsProps {
    searchParams: {
        page?: string;
        limit?: string;
    };
}

export default async function RecommendationsPage({ searchParams }: RecommendationsProps) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return (
            <main className="pb-20 mt-[50px] sm:mt-[72px]">
                <div className="max-w-frame mx-auto px-4 xl:px-0 py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Please log in to view recommendations</h1>
                    <Link href="/auth/signin" className="bg-black text-white px-6 py-3 rounded-full hover:bg-black/80 font-medium">
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    const currentPage = Number(searchParams.page) || 1;
    const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 12;

    const { products, total, totalPages } = await getRecommendedProducts(userId, currentPage, limit);

    // Calculate display range
    const startIndex = products.length > 0 ? (currentPage - 1) * limit + 1 : 0;
    const endIndex = Math.min(currentPage * limit, total);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push("ellipsis-start");
            }
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) {
                pages.push("ellipsis-end");
            }
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    const buildUrl = (newPage: number) => {
        const params = new URLSearchParams();
        if (limit !== 12) params.set("limit", limit.toString());
        if (newPage > 1) params.set("page", newPage.toString());
        const queryString = params.toString();
        return queryString ? `/recommendations?${queryString}` : '/recommendations';
    };

    return (
        <main className="pb-20 mt-[50px] sm:mt-[72px]">
            <div className="max-w-frame mx-auto px-4 xl:px-0">
                <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />

                <div className="mb-5 text-sm">
                    <span className="text-black/60">
                        <Link href="/" className="hover:text-black">Home</Link> &gt; <span className="text-black">Recommendations</span>
                    </span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-8">
                    <h1 className="font-bold text-2xl md:text-[32px]">Recommended For You</h1>
                    {products.length > 0 && (
                        <p className="text-black/60 text-sm md:text-base mt-2 md:mt-0">
                            Showing {startIndex}-{endIndex} of {total} products
                        </p>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-black/60 mb-4">No recommendations found at the moment.</p>
                        <Link href="/shop" className="text-black underline">
                            Browse Shop
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-5">
                            {products.map((product) => (
                                <ProductCard key={product.id} data={product} />
                            ))}
                        </div>

                        <hr className="border-t-black/10 my-10" />

                        <Pagination className="justify-between">
                            <PaginationPrevious
                                href={currentPage > 1 ? buildUrl(currentPage - 1) : "#"}
                                className={`border border-black/10 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
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
                                                href={buildUrl(pageNum as number)}
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
                                href={currentPage < totalPages ? buildUrl(currentPage + 1) : "#"}
                                className={`border border-black/10 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                            />
                        </Pagination>
                    </>
                )}
            </div>
        </main>
    );
}
