import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { Session } from "./auth";
import { logError } from "./error-logger";

/**
 * Server-side authentication utilities for Next.js App Router
 * 
 * Use these in Server Components, Server Actions, and Route Handlers
 */

/**
 * Get the current user session on the server side
 * 
 * @returns The current user session or null if not authenticated
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * const session = await getSession();
 * if (!session) {
 *   redirect('/sign-in');
 * }
 * ```
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session;
  } catch (error) {
    logError(error, { context: "get_session" });
    return null;
  }
}

/**
 * Get the current user on the server side
 * 
 * @returns The current user or null if not authenticated
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * const user = await getCurrentUser();
 * if (!user) {
 *   redirect('/sign-in');
 * }
 * ```
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Get the current user ID on the server side
 * 
 * @returns The current user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Check if the user is authenticated
 * 
 * @returns true if user is authenticated, false otherwise
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * if (!(await isAuthenticated())) {
 *   redirect('/sign-in');
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * 
 * Use in Server Components and Server Actions (not API routes)
 * For API routes, use requireAuthApi() instead
 * 
 * @returns The current user session
 * 
 * @example
 * ```tsx
 * // In a Server Component or Server Action
 * const session = await requireAuth();
 * // Now you can safely use session.user
 * ```
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session;
}

/**
 * Require authentication for API routes - returns 401 if not authenticated
 * 
 * Use this in API route handlers instead of requireAuth()
 * 
 * @returns The current user session
 * @throws NextResponse with 401 status if not authenticated
 * 
 * @example
 * ```tsx
 * // In an API route
 * export async function GET() {
 *   const session = await requireAuthApi();
 *   if (session instanceof NextResponse) {
 *     return session; // 401 response
 *   }
 *   // Now you can safely use session.user
 * }
 * ```
 */
export async function requireAuthApi(): Promise<Session | NextResponse> {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return session;
}

/**
 * Require authentication and return the user
 * 
 * @returns The current user
 * 
 * @example
 * ```tsx
 * // In a Server Component or Server Action
 * const user = await requireUser();
 * // Now you can safely use user.id, user.email, etc.
 * ```
 */
export async function requireUser() {
  const session = await requireAuth();
  return session.user;
}

/**
 * Require authentication and return the user ID
 * 
 * Use in Server Components and Server Actions (not API routes)
 * For API routes, use requireUserIdApi() instead
 * 
 * @returns The current user ID
 * 
 * @example
 * ```tsx
 * // In a Server Action
 * const userId = await requireUserId();
 * await createProblem(userId, data);
 * ```
 */
export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

/**
 * Require authentication and return the user ID for API routes
 * 
 * Use this in API route handlers instead of requireUserId()
 * 
 * @returns The current user ID or NextResponse with 401 if not authenticated
 * 
 * @example
 * ```tsx
 * // In an API route
 * export async function GET() {
 *   const userIdOrResponse = await requireUserIdApi();
 *   if (userIdOrResponse instanceof NextResponse) {
 *     return userIdOrResponse; // 401 response
 *   }
 *   // Use userIdOrResponse as userId for database operations
 * }
 * ```
 */
export async function requireUserIdApi(): Promise<string | NextResponse> {
  const session = await requireAuthApi();
  
  if (session instanceof NextResponse) {
    return session;
  }
  
  return session.user.id;
}
