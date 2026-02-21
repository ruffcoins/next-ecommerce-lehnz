import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
// import { Review } from "@/types/review.types";
import { getAllProducts, getRecommendedProducts } from "./actions/product-actions";

import { reviewsData } from "@/lib/data";

import Recommendations from "@/components/homepage/Recommendations";
import { auth } from "@/auth";

export default async function Home() {
  const [session, allProducts] = await Promise.all([
    auth(),
    getAllProducts()
  ]);

  // Split products into sections
  const newArrivalsData = allProducts.slice(0, 4);
  const topSellingData = allProducts.slice(4, 8);


  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <Recommendations />
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </>
  );
}
