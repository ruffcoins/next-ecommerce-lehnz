/**
 * DATABASE CONNECTION & MODELS
 * 
 * Purpose: Manages MongoDB connection using Mongoose with a caching strategy optimized for 
 * Next.js serverless environments. Defines the Customer data model for authentication and user management.
 * 
 * Architecture Role:
 * - Data Layer: Single source of truth for database connections and schema definitions
 * - Connection Caching: Prevents connection exhaustion in serverless/hot-reload scenarios
 * - Model Definition: Defines the Customer schema matching the existing MongoDB collection
 * 
 * Used By: Authentication system (auth.ts), Server Actions (auth-actions.ts)
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}

interface IMongooseGlobal {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}

declare global {
    var mongoose: IMongooseGlobal;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose.connection;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;

// --- Customer Model ---

export interface ICustomer extends mongoose.Document {
    customer_id: string;
    email?: string;
    password?: string;
    FN?: any; // Can be NaN, string, or null
    Active?: any; // Can be NaN, string, or null
    club_member_status?: string;
    fashion_news_frequency?: string;
    age?: number;
    postal_code?: string;
}

const CustomerSchema = new mongoose.Schema<ICustomer>(
    {
        customer_id: { type: String, required: true, unique: true },
        email: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
        password: { type: String },
        FN: mongoose.Schema.Types.Mixed, // Handle NaN values
        Active: mongoose.Schema.Types.Mixed, // Handle NaN values
        club_member_status: String,
        fashion_news_frequency: String,
        age: Number,
        postal_code: String,
    },
    {
        strict: false, // Allow other fields if they exist
        collection: "customers", // Maps to existing "customers" collection in MongoDB
    }
);

// Prevent overwriting model if already compiled
const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export { Customer };

// --- Transaction Model ---

export interface ITransaction extends mongoose.Document {
    t_dat: string; // Date stored as string in example
    customer_id: string;
    article_id: string;
    price: number;
    sales_channel_id: string;
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
    {
        t_dat: { type: String, required: true },
        customer_id: { type: String, required: true, index: true },
        article_id: { type: String, required: true },
        price: { type: Number, required: true },
        sales_channel_id: { type: String, required: true },
    },
    {
        collection: "transactions", // Maps to existing "transactions" collection
    }
);

// Prevent overwriting model if already compiled
const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

export { Transaction };

// --- Product Model ---

export interface IProductVariation {
    article_id: string;
    color_name: string;
    pattern: string;
    price: number;
}

export interface IProduct extends mongoose.Document {
    product_name: string;
    description: string;
    primary_category: string;
    secondary_category: string;
    product_type: string;
    department: string;
    variations: IProductVariation[];
    available_colors: string[];
    product_code: string;
}

const ProductVariationSchema = new mongoose.Schema({
    article_id: { type: String, required: true },
    color_name: { type: String, required: true },
    pattern: { type: String, required: true },
    price: { type: Number, required: true },
}, { _id: false });

const ProductSchema = new mongoose.Schema<IProduct>(
    {
        product_name: { type: String, required: true },
        description: { type: String, required: true },
        primary_category: { type: String, required: true },
        secondary_category: { type: String, required: true },
        product_type: { type: String, required: true },
        department: { type: String, required: true },
        variations: { type: [ProductVariationSchema], required: true },
        available_colors: { type: [String], required: true },
        product_code: { type: String, required: true },
    },
    {
        collection: "products", // Maps to existing "products" collection in MongoDB
    }
);

// Prevent overwriting model if already compiled
const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export { Product };

// --- Order Model ---

export interface IOrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    attributes: string[];
    srcUrl: string;
}

export interface IOrder extends mongoose.Document {
    customer_id?: string;
    items: IOrderItem[];
    total_amount: number;
    status: string;
    createdAt: Date;
}

const OrderItemSchema = new mongoose.Schema({
    product_id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    attributes: { type: [String], required: true },
    srcUrl: { type: String, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema<IOrder>(
    {
        customer_id: { type: String },
        items: [OrderItemSchema],
        total_amount: { type: Number, required: true },
        status: { type: String, default: "pending" },
    },
    {
        timestamps: true,
        collection: "orders",
    }
);

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export { Order };
