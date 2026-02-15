import React from "react";
import ProductListSec from "@/components/common/ProductListSec";
import { getRecommendedProducts } from "@/app/actions/product-actions";
import { auth } from "@/auth";

const Recommendations = async () => {
    const session = await auth();
    const { products } = await getRecommendedProducts(session?.user?.id || "");

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="mb-[50px] sm:mb-20">
            <ProductListSec
                title="Recommendations"
                data={products}
                viewAllLink="/recommendations"
            />
        </div>
    );
};

export default Recommendations;
