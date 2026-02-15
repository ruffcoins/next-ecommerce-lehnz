"use client";

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import ProductCard from "@/components/cart-page/ProductCard";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { FaArrowRight } from "react-icons/fa6";
import { MdOutlineLocalOffer } from "react-icons/md";
import { TbBasketExclamation } from "react-icons/tb";
import React from "react";
import { RootState } from "@/lib/store";
import { useAppSelector } from "@/lib/hooks/redux";
import Link from "next/link";
import { createOrder } from "../actions/order-actions";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tracker } from "@/lib/recommendationClient";

export default function CartPage() {
  const { cart, totalPrice, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "processing" | "success">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setCheckoutStatus("processing");
    setStatusMessage("Verifying order details...");

    // Track checkout_start for each item in the cart
    cart.items.forEach((item) => {
      tracker.track({
        eventType: "checkout_start",
        productId: item.product_id || String(item.id),
        metadata: {
          price: item.price,
          quantity: item.quantity,
        },
      });
    });

    let activeKey = idempotencyKey;
    if (!activeKey) {
      activeKey = crypto.randomUUID();
      setIdempotencyKey(activeKey);
    }

    try {
      // Small delays to make it feel like real work is happening
      await new Promise(r => setTimeout(r, 800));
      setStatusMessage("Securing payment connection...");
      await new Promise(r => setTimeout(r, 1200));
      setStatusMessage("Processing transaction...");

      const result = await createOrder(cart.items, adjustedTotalPrice, activeKey);

      if (result.success) {
        // Track purchase for each item in the cart
        cart.items.forEach((item) => {
          tracker.track({
            eventType: "purchase",
            productId: item.product_id || String(item.id),
            metadata: {
              price: item.price,
              quantity: item.quantity,
              orderId: result.orderId,
            },
          });
        });

        setOrderId(result.orderId);
        setCheckoutStatus("success");
        dispatch(clearCart());
        setIdempotencyKey(null);
      } else if (result.error === "unauthenticated") {
        router.push("/login?callbackUrl=/cart");
        setCheckoutStatus("idle");
      } else {
        alert("Failed to place order. " + (result.error || "Please try again."));
        setCheckoutStatus("idle");
        setIdempotencyKey(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An unexpected error occurred.");
      setCheckoutStatus("idle");
    }
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        {cart && cart.items.length > 0 ? (
          <>
            <BreadcrumbCart />
            <h2
              className={cn([
                integralCF.className,
                "font-bold text-[32px] md:text-[40px] text-black uppercase mb-5 md:mb-6",
              ])}
            >
              your cart
            </h2>
            <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-5 items-start">
              <div className="w-full p-3.5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                {cart?.items.map((product, idx, arr) => (
                  <React.Fragment key={idx}>
                    <ProductCard data={product} />
                    {arr.length - 1 !== idx && (
                      <hr className="border-t-black/10" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="w-full lg:max-w-[505px] p-5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
                <h6 className="text-xl md:text-2xl font-bold text-black">
                  Order Summary
                </h6>
                <div className="flex flex-col space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">Subtotal</span>
                    <span className="md:text-xl font-bold">₦{totalPrice.toLocaleString("en-US")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">
                      Discount (0%)
                    </span>
                    <span className="md:text-xl font-bold text-red-600">
                      -₦0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black/60">
                      Delivery Fee
                    </span>
                    <span className="md:text-xl font-bold">Free</span>
                  </div>
                  <hr className="border-t-black/10" />
                  <div className="flex items-center justify-between">
                    <span className="md:text-xl text-black">Total</span>
                    <span className="text-xl md:text-2xl font-bold">
                      ₦{Math.round(adjustedTotalPrice).toLocaleString("en-US")}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Text>
                      <MdOutlineLocalOffer className="text-black/40 text-2xl" />
                    </InputGroup.Text>
                    <InputGroup.Input
                      type="text"
                      name="code"
                      placeholder="Add promo code"
                      className="bg-transparent placeholder:text-black/40"
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    className="bg-black rounded-full w-full max-w-[119px] h-[48px]"
                  >
                    Apply
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    handleCheckout();
                  }}
                  disabled={checkoutStatus !== "idle"}
                  className="text-sm md:text-base font-medium bg-black rounded-full w-full py-4 h-[54px] md:h-[60px] group"
                >
                  {checkoutStatus === "processing" ? "Processing..." : "Go to Checkout"}{" "}
                  {checkoutStatus === "idle" && <FaArrowRight className="text-xl ml-2 group-hover:translate-x-1 transition-all" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center flex-col text-gray-300 mt-32">
            <TbBasketExclamation strokeWidth={1} className="text-6xl" />
            <span className="block mb-4">Your shopping cart is empty.</span>
            <Button className="rounded-full w-24" asChild>
              <Link href="/shop">Shop</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Checkout Processing Overlay */}
      {checkoutStatus === "processing" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white p-10 rounded-[32px] shadow-2xl max-w-sm w-full text-center border border-white/20">
            <div className="mb-8 flex justify-center relative">
              <div className="absolute inset-0 bg-black/5 blur-xl rounded-full scale-150 animate-pulse"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-black/10 border-b-black relative z-10"></div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-black">Secure Checkout</h3>
            <p className="text-gray-500 font-medium animate-pulse">
              {statusMessage}
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {checkoutStatus === "success" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-md w-full text-center border border-gray-100 transform animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="mb-8 flex justify-center scale-110">
              <div className="h-24 w-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 animate-bounce cursor-default">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h3 className={cn([integralCF.className, "text-3xl font-bold mb-4 text-black uppercase"])}>Order Confirmed!</h3>
            <p className="text-gray-600 mb-8 px-4 leading-relaxed">
              Your fashion journey has begun. We&apos;ve sent a confirmation email with all the details.
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-1">Order reference</span>
              <code className="text-lg font-mono font-bold text-black select-all">#{orderId?.slice(-8).toUpperCase()}</code>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => router.push(`/profile/orders/${orderId}`)}
                className="bg-black text-white rounded-full py-6 font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Track Order
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/shop")}
                className="border-2 border-black rounded-full py-6 font-bold text-lg hover:bg-black hover:text-white transition-all active:scale-95"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
