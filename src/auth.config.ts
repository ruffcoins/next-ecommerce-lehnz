/**
 * NEXTAUTH CONFIGURATION
 * 
 * Purpose: Defines NextAuth settings that are safe for Edge runtime (middleware-compatible).
 * Configures session/JWT callbacks and custom pages.
 * 
 * Architecture Role:
 * - Auth Configuration: Centralizes NextAuth settings for use in auth.ts and middleware
 * - Session Customization: Adds customer_id to session token and user object
 * - Edge-Safe: Contains no database calls, making it safe for middleware usage
 * 
 * Used By: auth.ts (main auth setup), middleware.ts (route protection)
 */

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                // Add customer_id to session
                // We might need to fetch customer again or store it in token
                session.user.id = token.sub;
                // Note: default session.user.id is usually subject, but we can verify
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = (user as any).customer_id; // Use customer_id as the subject ID
            }
            return token;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
