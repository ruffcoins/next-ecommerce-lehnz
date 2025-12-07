/**
 * NEXTAUTH AUTHENTICATION SETUP
 * 
 * Purpose: Configures NextAuth v5 with credential-based authentication using the Customer model.
 * Handles user lookup and password verification for login.
 * 
 * Architecture Role:
 * - Authentication Provider: Implements credentials provider for email/password auth
 * - User Verification: Validates user credentials against MongoDB via bcrypt
 * - Session Management: Exports auth handlers for both server and client usage
 * 
 * Used By: API routes (route.ts), Server Components, Middleware (middleware.ts)
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect, { Customer } from "./lib/db";
import { z } from "zod";
import { authConfig } from "./auth.config";

async function getCustomer(email: string) {
    await dbConnect();
    try {
        const customer = await Customer.findOne({ email });
        return customer;
    } catch (error) {
        console.error("Failed to fetch customer:", error);
        throw new Error("Failed to fetch customer.");
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const customer = await getCustomer(email);

                    if (!customer) return null;

                    // Check if password exists (it should for active customers)
                    if (!customer.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, customer.password);
                    if (passwordsMatch) return customer;
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
});
