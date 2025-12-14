import { auth, signOut } from "@/auth";
import dbConnect, { Customer, Order } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { satoshi } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import OrdersTable from "@/components/profile/OrdersTable";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    await dbConnect();

    // Fetch full customer details
    // session.user.email is standard, but we might have customer_id in sub/id depending on auth callback
    // Let's try finding by email first as it is unique
    let customer: any = null;
    if (session.user.email) {
        customer = await Customer.findOne({ email: session.user.email });
    }

    if (!customer && session.user.id) {
        customer = await Customer.findOne({ customer_id: session.user.id });
    }

    if (!customer) {
        // Should not happen for logged in user, but handle gracefully
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Profile not found.</h1>
                <form
                    action={async () => {
                        "use server";
                        await signOut();
                    }}
                >
                    <button className="mt-4 bg-black text-white px-4 py-2 rounded-full">Sign Out</button>
                </form>
            </div>
        );
    }

    // Fetch recent orders
    const ordersRaw = await Order.find({ customer_id: session.user.id })
        .sort({ createdAt: -1 }) // Sort by date descending
        .limit(10)
        .lean();

    const orders = JSON.parse(JSON.stringify(ordersRaw));

    return (
        <div className="container relative mx-auto max-w-frame px-4 xl:px-0 py-8 lg:py-12">
            <h1 className={cn(satoshi.className, "text-3xl md:text-4xl font-bold mb-8")}>
                My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Details Card */}
                <div className="md:col-span-1 border rounded-[20px] p-6 h-fit space-y-4">
                    <h2 className="text-xl font-bold mb-4">Account Details</h2>

                    <div className="space-y-2">
                        <p className="text-gray-500 text-sm">Full Name (FN)</p>
                        <p className="font-medium">{customer.FN || "N/A"}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-gray-500 text-sm">Email</p>
                        <p className="font-medium truncate" title={customer.email}>{customer.email || "N/A"}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-gray-500 text-sm">Club Status</p>
                        <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                            {customer.club_member_status || "N/A"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-gray-500 text-sm">News Frequency</p>
                        <p className="font-medium">{customer.fashion_news_frequency || "N/A"}</p>
                    </div>

                    <div className="pt-4 border-t mt-4">
                        <form
                            action={async () => {
                                "use server";
                                await signOut();
                            }}
                        >
                            <button
                                type="submit"
                                className="w-full bg-black text-white font-medium py-3 rounded-full hover:bg-gray-800 transition-colors"
                            >
                                Log Out
                            </button>
                        </form>
                    </div>
                </div>

                {/* Orders / Transactions Section */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold">Recent Orders</h2>

                    <div className="border rounded-[20px] overflow-hidden">
                        <OrdersTable orders={orders} />
                    </div>
                </div>
            </div>
        </div>
    );
}
