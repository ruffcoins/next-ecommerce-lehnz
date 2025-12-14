import { auth } from "@/auth";
import { getOrder } from "@/app/actions/order-actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { satoshi } from "@/styles/fonts";

export default async function OrderPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const order = await getOrder(params.id);

    if (!order) notFound();

    return (
        <div className="container mx-auto px-4 xl:px-0 py-8 lg:py-12 max-w-frame">
            <div className="mb-8">
                <Link href="/profile" className="text-gray-500 hover:text-black mb-4 inline-block text-sm">
                    &larr; Back to Order History
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className={cn(satoshi.className, "text-3xl font-bold")}>
                        Order #{order._id.slice(-6)}
                    </h1>
                    <span className={cn(
                        "capitalize px-3 py-1 rounded-full text-sm font-medium w-fit",
                        order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                        {order.status}
                    </span>
                </div>
                <p className="text-gray-500 mt-2">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="border rounded-[20px] p-6">
                        <h2 className="text-xl font-bold mb-4">Items</h2>
                        <div className="space-y-6">
                            {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex gap-4 border-b last:border-0 pb-6 last:pb-0">
                                    <div className="relative w-20 h-24 md:w-24 md:h-32 bg-[#F0EEED] rounded-lg overflow-hidden flex-shrink-0">
                                        {item.srcUrl ? (
                                            <Image src={item.srcUrl} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-base md:text-lg">{item.name}</h3>
                                                <div className="text-sm text-gray-500 mt-1 space-y-1">
                                                    {item.attributes.map((attr: string, idx: number) => (
                                                        <p key={idx}>{attr}</p>
                                                    ))}
                                                    <p>Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-base md:text-lg">₦{item.price.toLocaleString("en-US")}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 space-y-6">
                    <div className="border rounded-[20px] p-6">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">₦{order.total_amount.toLocaleString("en-US")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium">Free</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax</span>
                                <span className="font-medium">₦0.00</span>
                            </div>
                            <div className="border-t pt-3 mt-3 flex justify-between text-base md:text-lg font-bold">
                                <span>Total</span>
                                <span>₦{order.total_amount.toLocaleString("en-US")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-[20px] p-6">
                        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            123 Fashion Street<br />
                            Lagos, Nigeria 100001
                        </p>
                        <p className="text-xs text-gray-400 mt-2">(Simulated address)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
