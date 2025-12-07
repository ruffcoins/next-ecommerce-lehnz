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
