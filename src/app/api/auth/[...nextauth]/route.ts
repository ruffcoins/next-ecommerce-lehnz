/**
 * NEXTAUTH API ROUTE HANDLER
 * 
 * Purpose: Exports NextAuth HTTP handlers for authentication endpoints.
 * This route handles all NextAuth requests (signin, signout, callback, etc.)
 * 
 * Architecture Role:
 * - API Endpoint: Provides /api/auth/* routes for NextAuth operations
 * - Request Handler: Delegates to NextAuth handlers from auth.ts
 * 
 * Used By: NextAuth client (signIn, signOut functions), OAuth callbacks
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
