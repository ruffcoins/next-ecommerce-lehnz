"use client";

/**
 * MOBILE SEARCH PAGE (Client Component)
 * 
 * Purpose: Dedicated search page for mobile users with search-focused interface.
 * Provides a full-screen search experience with suggestions and results.
 * 
 * Architecture Role:
 * - Client Component: Handles search input and navigation
 * - Mobile-First: Optimized for mobile search experience
 * - Navigation: Redirects to shop page with search results
 * 
 * Used By: Mobile navbar search icon
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiSearch } from "react-icons/fi";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

    // Auto-focus the input when page loads
    useEffect(() => {
        const input = document.getElementById("mobile-search-input");
        if (input) {
            input.focus();
        }
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push("/shop");
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Popular search suggestions
    const suggestions = [
        "T-shirts",
        "Jeans",
        "Dresses",
        "Sneakers",
        "Jackets",
        "Bags",
    ];

    const handleSuggestionClick = (suggestion: string) => {
        router.push(`/shop?search=${encodeURIComponent(suggestion)}`);
    };

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-frame mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-3 py-5 border-b border-black/10">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <FiArrowLeft className="text-2xl" />
                    </button>
                    <h1 className="text-xl font-bold">Search Products</h1>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-black/40" />
                        <input
                            id="mobile-search-input"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for products..."
                            className="w-full pl-12 pr-4 py-4 bg-[#F0F0F0] rounded-full text-base placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full mt-4 py-6 text-base font-medium rounded-full"
                    >
                        Search
                    </Button>
                </form>

                {/* Suggestions */}
                <div className="mt-8">
                    <h2 className="text-sm font-medium text-black/60 mb-4">
                        Popular Searches
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-2 bg-[#F0F0F0] rounded-full text-sm hover:bg-black hover:text-white transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-12 text-center text-sm text-black/40">
                    <p>Enter a search term to find products</p>
                    <p className="mt-1">You can search by name, category, or description</p>
                </div>
            </div>
        </main>
    );
}
