"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Order {
    _id: string;
    createdAt: string;
    status: string;
    total_amount: number;
    items: any[];
}

interface OrdersTableProps {
    orders: Order[];
}

const OrdersTable = ({ orders }: OrdersTableProps) => {
    const router = useRouter();

    if (orders.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500">
                <p>No recent orders found.</p>
                <Link
                    href="/shop"
                    className="text-black underline mt-2 block hover:no-underline"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-medium text-gray-500">Order ID</th>
                        <th className="p-4 font-medium text-gray-500">Date</th>
                        <th className="p-4 font-medium text-gray-500">Status</th>
                        <th className="p-4 font-medium text-gray-500">Total</th>
                        <th className="p-4 font-medium text-gray-500">Items</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {orders.map((order) => (
                        <tr
                            key={order._id}
                            onClick={() => router.push(`/profile/orders/${order._id}`)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                            <td className="p-4 font-mono text-sm uppercase group-hover:underline">
                                #{order._id.slice(-6)}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </td>
                            <td className="p-4">
                                <span
                                    className={cn(
                                        "capitalize px-2 py-1 rounded-full text-xs font-medium",
                                        order.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    )}
                                >
                                    {order.status}
                                </span>
                            </td>
                            <td className="p-4 font-medium">
                                ₦{order.total_amount.toLocaleString("en-US")}
                            </td>
                            <td className="p-4 text-sm text-gray-500">
                                {order.items.length} items
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTable;
