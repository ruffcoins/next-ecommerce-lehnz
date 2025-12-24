"use server";

import mongoose from "mongoose";
import dbConnect, { Order, Transaction, Product, IProductVariation } from "@/lib/db";
import { CartItem } from "@/lib/features/carts/cartsSlice";

import { auth } from "@/auth";

export async function createOrder(cartItems: CartItem[], totalAmount: number, idempotencyKey?: string) {
    await dbConnect();

    // 1. Idempotency Check
    if (idempotencyKey) {
        const existingOrder = await Order.findOne({ idempotency_key: idempotencyKey });
        if (existingOrder) {
            console.log(`Order already exists for key: ${idempotencyKey}`);
            return { success: true, orderId: existingOrder._id.toString(), duplicate: true };
        }
    }

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        const session = await auth();

        if (!session || !session.user) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return { success: false, error: "unauthenticated" };
        }

        // 2. Server-Side Price Verification
        const articleIds = cartItems.map(item => item.article_id);
        const products = await Product.find({
            "variations.article_id": { $in: articleIds }
        }).session(dbSession);

        let serverCalculatedTotal = 0;
        const verifiedItems = [];

        for (const cartItem of cartItems) {
            const product = products.find(p =>
                p.variations.some((v: IProductVariation) => v.article_id === cartItem.article_id)
            );

            if (!product) throw new Error(`Product not found for article ${cartItem.article_id}`);

            const variation = product.variations.find((v: IProductVariation) => v.article_id === cartItem.article_id);
            if (!variation) throw new Error(`Variation not found for article ${cartItem.article_id}`);

            const basePrice = variation.price;
            let itemPrice = basePrice;
            if (cartItem.discount) {
                if (cartItem.discount.percentage > 0) {
                    itemPrice = Math.round(basePrice - (basePrice * cartItem.discount.percentage) / 100);
                } else if (cartItem.discount.amount > 0) {
                    itemPrice = Math.round(basePrice - cartItem.discount.amount);
                }
            }

            serverCalculatedTotal += itemPrice * cartItem.quantity;

            verifiedItems.push({
                product_id: product._id,
                product_code: product.product_code,
                article_id: cartItem.article_id,
                product_name: product.product_name,
                color_name: variation.color_name,
                pattern: variation.pattern,
                price: itemPrice,
                quantity: cartItem.quantity,
                image_url: cartItem.image_url
            });
        }

        if (Math.abs(serverCalculatedTotal - totalAmount) > 1) {
            throw new Error(`Price mismatch: Server calculated ${serverCalculatedTotal}, Client sent ${totalAmount}`);
        }

        // 3. Create the Order (Strictly Atomic)
        const [newOrder] = await Order.create([{
            customer_id: session?.user?.id,
            items: verifiedItems,
            total_amount: serverCalculatedTotal,
            transaction_count: cartItems.length,
            status: "completed",
            idempotency_key: idempotencyKey,
            created_at: new Date(),
            updated_at: new Date(),
        }], { session: dbSession });

        // 4. Create Transactions (Strictly Atomic)
        const transactions = [];
        const midnightDate = new Date();
        midnightDate.setUTCHours(0, 0, 0, 0);

        for (const item of verifiedItems) {
            for (let i = 0; i < item.quantity; i++) {
                transactions.push({
                    t_dat: midnightDate,
                    customer_id: session.user.id,
                    article_id: item.article_id,
                    price: item.price,
                    sales_channel_id: 2
                });
            }
        }

        if (transactions.length > 0) {
            await Transaction.insertMany(transactions, { session: dbSession });
        }

        // 5. Commit all changes
        await dbSession.commitTransaction();
        dbSession.endSession();

        return { success: true, orderId: newOrder._id.toString() };
    } catch (error: any) {
        // Rollback on any failure
        await dbSession.abortTransaction();
        dbSession.endSession();
        console.error("Order process failed:", error.message);
        return { success: false, error: error.message || "Failed to process order" };
    }
}

export async function getOrder(orderId: string) {
    try {
        const session = await auth();
        if (!session?.user) return null;

        await dbConnect();

        const order = await Order.findById(orderId).lean();

        if (!order) return null;

        // Convert to string for comparison if needed, though usually string in DB
        if (order.customer_id !== session.user.id) return null;

        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}
