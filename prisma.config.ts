import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma Configuration for Prisma 6
 * 
 * This file configures Prisma ORM settings including schema location
 * and migrations path.
 * 
 * Note: Database connection URL is configured in schema.prisma datasource block.
 * In Prisma 7, this will move to prisma.config.ts, but for Prisma 6, it stays in schema.prisma.
 */
export default defineConfig({
  // Schema file location (can be a file or directory for multi-file schemas)
  schema: "prisma/schema.prisma",
  
  // Migrations configuration
  migrations: {
    path: "prisma/migrations",
  },
});
