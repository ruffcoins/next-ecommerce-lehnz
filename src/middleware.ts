/**
 * ROUTE PROTECTION MIDDLEWARE
 * 
 * Purpose: Intercepts requests to protected routes and redirects unauthenticated users to login.
 * Runs on Edge runtime for optimal performance.
 * 
 * Architecture Role:
 * - Security Layer: Enforces authentication requirements before route access
 * - Request Interception: Checks auth status and redirects before page load
 * - Protected Routes: Currently protects /profile and /orders paths
 * 
 * Used By: Next.js middleware system (runs on every request matching config)
 */

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnProtectedRoute =
        req.nextUrl.pathname.startsWith("/profile") ||
        req.nextUrl.pathname.startsWith("/orders");

    if (isOnProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
