"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client for Client Components
 * 
 * Use this in Client Components, hooks, and client-side code.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { authClient } from '@/lib/auth-client';
 * 
 * export function SignInButton() {
 *   const { data: session } = authClient.useSession();
 *   
 *   if (session) {
 *     return <button onClick={() => authClient.signOut()}>Sign Out</button>;
 *   }
 *   
 *   return <button onClick={() => authClient.signIn.email({ email, password })}>Sign In</button>;
 * }
 * ```
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});
