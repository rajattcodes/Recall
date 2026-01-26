import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

/**
 * Next.js Middleware for Authentication
 * 
 * Protects routes and handles authentication checks.
 * Runs on Edge Runtime for optimal performance.
 */

// Routes that require authentication
// Note: (dashboard) route group doesn't appear in URL, so we check the actual paths
const protectedRoutes = [
  "/today",
  "/add",
  "/patterns",
  "/api/problems",
  "/api/patterns/custom",
  "/api/patterns/overview",
];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/public") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session from cookie (optimistic check)
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing protected route without session, redirect to sign-in
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing auth routes while authenticated, redirect to home
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
