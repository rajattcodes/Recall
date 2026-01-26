"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Custom hook for authentication state
 * 
 * Provides convenient access to authentication state and user data
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useAuth } from '@/hooks/use-auth';
 * 
 * export function UserProfile() {
 *   const { user, isAuthenticated, isLoading } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <div>Please sign in</div>;
 *   
 *   return <div>Welcome, {user?.email}</div>;
 * }
 * ```
 */
export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  return {
    user: session?.user || null,
    session: session || null,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    error,
    signOut: () => authClient.signOut(),
  };
}
