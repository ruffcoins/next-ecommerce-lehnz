"use client";

import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { tracker } from "@/lib/recommendationClient";
import { RootState } from "@/lib/store";
import { Product } from "@/types/product.types";
import React from "react";

const AddToCartBtn = ({ data }: { data: Product & { quantity: number } }) => {
  const dispatch = useAppDispatch();
  const { sizeSelection, colorSelection, selectedVariation } = useAppSelector(
    (state: RootState) => state.products
  );

  // Use the selected variation's price if available, otherwise use the base product price
  const currentPrice = selectedVariation?.price ?? data?.variations?.[0].price;

  return (
    <button
      type="button"
      className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all"
      onClick={() => {
        dispatch(
          addToCart({
            id: selectedVariation ? selectedVariation.article_id : parseInt(data.id),
            product_id: data.id,
            article_id: selectedVariation ? selectedVariation.article_id : parseInt(data.id),
            product_code: data.product_code || 0,
            product_name: data.title,
            color_name: selectedVariation?.color_name || colorSelection.name,
            pattern: selectedVariation?.pattern || "",
            image_url: selectedVariation ? `${selectedVariation.article_id}.jpg` : data.srcUrl,
            price: (currentPrice as number),
            attributes: [sizeSelection, colorSelection.name],
            discount: data.discount,
            quantity: data.quantity,
          })
        )

        tracker.track({
          eventType: "add_to_cart",
          productId: data.id,
        })
      }}
    >
      Add to Cart
    </button>
  );
};

export default AddToCartBtn;
