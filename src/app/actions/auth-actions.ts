/**
 * AUTHENTICATION SERVER ACTIONS
 * 
 * Purpose: Provides server-side functions for account activation, registration, and customer verification.
 * Handles password hashing and database operations securely on the server.
 * 
 * Architecture Role:
 * - Business Logic Layer: Implements core authentication workflows (activate, register, verify)
 * - Data Mutation: Handles customer creation and updates in MongoDB
 * - Password Security: Uses bcrypt for secure password hashing
 * 
 * Used By: Login page (page.tsx) via form submissions
 */

"use server";

import { Customer } from "@/lib/db"; // Adjust import path
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { signIn } from "@/auth"; // Server-side signin if needed, or use client
import { AuthError } from "next-auth";

export async function checkCustomerId(customerId: string) {
    await dbConnect();
    try {
        const customer = await Customer.findOne({ customer_id: customerId });
        if (!customer) {
            return { success: false, message: "Customer ID not found." };
        }
        if (customer.email && customer.password) {
            // Already claimed
            return { success: true, claimed: true, message: "Account already active. Please log in." };
        }
        return { success: true, claimed: false, message: "ID verified." };
    } catch (error) {
        console.error("Error checking ID:", error);
        return { success: false, message: "Database error." };
    }
}

export async function activateAccount(prevState: any, formData: FormData) {
    await dbConnect();
    const customerId = formData.get("customerId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!customerId || !email || !password) {
        return { error: "Missing fields" };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const customer = await Customer.findOneAndUpdate(
            { customer_id: customerId },
            { email, password: hashedPassword },
            { new: true }
        );
        if (!customer) return { error: "Customer not found" };
        return { success: true };
    } catch (err) {
        return { error: "Activation failed" };
    }
}

export async function registerNewUser(prevState: any, formData: FormData) {
    await dbConnect();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Missing fields" };
    }

    try {
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return { error: "Email already in use." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomerId = uuidv4().replace(/-/g, "").substring(0, 24); // Simulate similar ID format

        await Customer.create({
            customer_id: newCustomerId,
            email,
            password: hashedPassword,
            Active: "Active",
            club_member_status: "ACTIVE",
            fashion_news_frequency: "Regularly"
        });

        return { success: true };
    } catch (error) {
        console.error("Reg error:", error);
        return { error: "Registration failed." };
    }
}
