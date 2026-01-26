import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

/**
 * Better Auth Configuration
 * 
 * Configured with:
 * - Prisma adapter (Prisma 6 compatible)
 * - Email/Password authentication
 * - Session management
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001", // For potential port changes
    ...(process.env.NODE_ENV === "production"
      ? [process.env.BETTER_AUTH_URL || ""]
      : []),
  ].filter(Boolean), // Remove empty strings
});

export type Session = typeof auth.$Infer.Session;
