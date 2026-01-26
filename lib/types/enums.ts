/**
 * TypeScript enums matching Prisma database enums
 * These types are used throughout the application for type safety
 */

export enum ProblemStatus {
  FRESH = "fresh",
  ACTIVE = "active",
  FAILED = "failed",
  MASTERED = "mastered",
}

export enum ReminderStage {
  DAY_3 = "day_3",
  DAY_10 = "day_10",
  DAY_30 = "day_30",
  COMPLETED = "completed",
}

export enum AttemptResult {
  SOLVED = "solved",
  FAILED = "failed",
}

/**
 * Type unions for better type inference
 */
export type ProblemStatusType = "fresh" | "active" | "failed" | "mastered";
export type ReminderStageType = "day_3" | "day_10" | "day_30" | "completed";
export type AttemptResultType = "solved" | "failed";
