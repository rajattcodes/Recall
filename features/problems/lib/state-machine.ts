import { addDays } from "date-fns";
import type { ProblemStatusType, ReminderStageType } from "@/lib/types/enums";

/**
 * Problem State Machine
 * 
 * Handles state transitions for problems based on user actions.
 * This will be refactored in Phase 5, but implemented here for Phase 4 API endpoints.
 */

export interface ProblemStateUpdate {
  status: ProblemStatusType;
  reminderStage: ReminderStageType;
  nextReminderDate: Date;
  failureCount?: number;
  totalAttempts: number;
  lastAttemptedAt: Date;
}

/**
 * Mark a problem as solved
 * 
 * Transitions based on current reminder stage:
 * - day_3 → day_10 (status: active, next_reminder_date: today + 10)
 * - day_10 → day_30 (status: active, next_reminder_date: today + 30)
 * - day_30 → mastered (status: mastered, reminder_stage: completed)
 * 
 * Always increments total_attempts and updates last_attempted_at
 */
export function markProblemSolved(
  problem: { reminderStage: ReminderStageType; totalAttempts: number },
  currentDate: Date = new Date()
): ProblemStateUpdate {
  const totalAttempts = problem.totalAttempts + 1;
  const lastAttemptedAt = currentDate;

  switch (problem.reminderStage) {
    case "day_3":
      return {
        status: "active",
        reminderStage: "day_10",
        nextReminderDate: addDays(currentDate, 10),
        totalAttempts,
        lastAttemptedAt,
      };

    case "day_10":
      return {
        status: "active",
        reminderStage: "day_30",
        nextReminderDate: addDays(currentDate, 30),
        totalAttempts,
        lastAttemptedAt,
      };

    case "day_30":
      return {
        status: "mastered",
        reminderStage: "completed",
        nextReminderDate: currentDate, // Set to today when mastered
        totalAttempts,
        lastAttemptedAt,
      };

    case "completed":
      // Already completed, no transition needed
      return {
        status: "mastered",
        reminderStage: "completed",
        nextReminderDate: currentDate,
        totalAttempts,
        lastAttemptedAt,
      };

    default:
      throw new Error(`Invalid reminder stage: ${problem.reminderStage}`);
  }
}

/**
 * Mark a problem as failed
 * 
 * Resets to:
 * - status: 'failed'
 * - reminder_stage: 'day_3'
 * - next_reminder_date: today + 3 days
 * - Increments failure_count
 * - Increments total_attempts
 * - Updates last_attempted_at
 */
export function markProblemFailed(
  problem: { failureCount: number; totalAttempts: number },
  currentDate: Date = new Date()
): ProblemStateUpdate {
  return {
    status: "failed",
    reminderStage: "day_3",
    nextReminderDate: addDays(currentDate, 3),
    failureCount: problem.failureCount + 1,
    totalAttempts: problem.totalAttempts + 1,
    lastAttemptedAt: currentDate,
  };
}
