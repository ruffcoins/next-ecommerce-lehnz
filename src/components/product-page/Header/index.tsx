"use client";

import React, { useEffect } from "react";
import PhotoSection from "./PhotoSection";
import { Product } from "@/types/product.types";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import ColorSelection from "./ColorSelection";
import SizeSelection from "./SizeSelection";
import AddToCardSection from "./AddToCardSection";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { setSelectedVariation } from "@/lib/features/products/productsSlice";
import { tracker } from "@/lib/recommendationClient";

const Header = ({ data }: { data: Product }) => {
  const dispatch = useAppDispatch();
  const { selectedVariation } = useAppSelector(
    (state: RootState) => state.products
  );

  // Check if product has color variations
  const hasColorVariations = data.available_colors && data.available_colors.length > 0;

  // For now, we'll hide size selection since it's not in the MongoDB schema
  // You can add a size field to your products collection if needed
  const hasSizeVariations = false;

  // Initialize with the first variation if available
  // Reset when navigating to a different product
  useEffect(() => {
    if (data.variations && data.variations.length > 0) {
      dispatch(setSelectedVariation(data.variations[0]));
    }
  }, [data.id, data.variations, dispatch]);

  // Use the selected variation's price if available, otherwise use the base product price
  const currentPrice = selectedVariation?.price ?? 10000;

  useEffect(() => {
    tracker.track({
      eventType: 'view',
      productId: data.id,
      metadata: { category: data.category, price: currentPrice }
    });
  }, [data.id]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <PhotoSection data={data} />
        </div>
        <div>
          <h1
            className={cn([
              integralCF.className,
              "text-2xl md:text-[40px] md:leading-[40px] mb-3 md:mb-3.5 capitalize",
            ])}
          >
            {data.title}
          </h1>
          <div className="flex items-center mb-3 sm:mb-3.5">
            <Rating
              initialValue={data.rating}
              allowFraction
              SVGclassName="inline-block"
              emptyClassName="fill-gray-50"
              size={25}
              readonly
            />
            <span className="text-black text-xs sm:text-sm ml-[11px] sm:ml-[13px] pb-0.5 sm:pb-0">
              {data.rating.toFixed(1)}
              <span className="text-black/60">/5</span>
            </span>
          </div>
          <div className="flex items-center space-x-2.5 sm:space-x-3 mb-5">
            {data.discount.percentage > 0 ? (
              <span className="font-bold text-black text-2xl sm:text-[32px]">
                {`₦${Math.round(
                  currentPrice - (currentPrice * data.discount.percentage) / 100
                ).toLocaleString("en-US")}`}
              </span>
            ) : data.discount.amount > 0 ? (
              <span className="font-bold text-black text-2xl sm:text-[32px]">
                {`₦${(currentPrice - data.discount.amount).toLocaleString("en-US")}`}
              </span>
            ) : (
              <span className="font-bold text-black text-2xl sm:text-[32px]">
                ₦{currentPrice?.toLocaleString("en-US")}
              </span>
            )}
            {data.discount.percentage > 0 && (
              <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                ₦{currentPrice?.toLocaleString("en-US")}
              </span>
            )}
            {data.discount.amount > 0 && (
              <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                ₦{currentPrice?.toLocaleString("en-US")}
              </span>
            )}
            {data.discount.percentage > 0 ? (
              <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                {`-${data.discount.percentage}%`}
              </span>
            ) : (
              data.discount.amount > 0 && (
                <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                  {`-₦${data.discount.amount.toLocaleString("en-US")}`}
                </span>
              )
            )}
          </div>
          <p className="text-sm sm:text-base text-black/60 mb-5">
            {data.description || "This product is perfect for any occasion. Crafted with quality materials for superior comfort and style."}
          </p>

          {/* Only show color selection if product has color variations */}
          {hasColorVariations && (
            <>
              <hr className="h-[1px] border-t-black/10 mb-5" />
              <ColorSelection colors={data.available_colors} variations={data.variations} />
            </>
          )}

          {/* Only show size selection if product has size variations */}
          {hasSizeVariations && (
            <>
              <hr className="h-[1px] border-t-black/10 my-5" />
              <SizeSelection />
            </>
          )}

          <hr className="hidden md:block h-[1px] border-t-black/10 my-5" />
          <AddToCardSection data={data} />
        </div>
      </div>
    </>
  );
};

export default Header;
