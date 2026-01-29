import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 * 
 * Prevents multiple instances of Prisma Client in development
 * due to hot module reloading. In production, this ensures
 * a single instance is reused across the application.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
