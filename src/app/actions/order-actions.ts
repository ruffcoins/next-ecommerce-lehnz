"use server";

import dbConnect, { Order } from "@/lib/db";
import { CartItem } from "@/lib/features/carts/cartsSlice";

import { auth } from "@/auth";

export async function createOrder(cartItems: CartItem[], totalAmount: number) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return { success: false, error: "unauthenticated" };
        }

        await dbConnect();

        // In a real app, we would get the user session here.
        // For simulation, we can assume a guest or mock user if no session is available.

        // Simulate a slight delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newOrder = await Order.create({
            customer_id: session?.user?.id,
            items: cartItems.map(item => ({
                product_id: item.id.toString(), // Ensure string if needed
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                attributes: item.attributes,
                srcUrl: item.srcUrl
            })),
            total_amount: totalAmount,
            status: "completed", // Simulating immediate completion
        });

        return { success: true, orderId: newOrder._id.toString() };
    } catch (error) {
        return { success: false, error: "Failed to create order" };
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
