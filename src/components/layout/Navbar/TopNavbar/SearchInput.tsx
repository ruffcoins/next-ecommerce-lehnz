"use client";

/**
 * SEARCH INPUT COMPONENT (Client Component)
 * 
 * Purpose: Handles search input functionality in the navbar.
 * Navigates to shop page with search query on form submission.
 * 
 * Architecture Role:
 * - Client Component: Handles user interaction and form submission
 * - Navigation: Redirects to /shop with search parameter
 * - State Management: Manages search input value
 * 
 * Used By: TopNavbar component
 */

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push("/shop");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="hidden md:flex flex-1">
            <InputGroup className="bg-[#F0F0F0] mr-3 lg:mr-10">
                <InputGroup.Text>
                    <Image
                        priority
                        src="/icons/search.svg"
                        height={20}
                        width={20}
                        alt="search"
                        className="min-w-5 min-h-5"
                    />
                </InputGroup.Text>
                <InputGroup.Input
                    type="search"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="bg-transparent placeholder:text-black/40"
                />
            </InputGroup>
        </form>
    );
}
