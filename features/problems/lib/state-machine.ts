import { addDays, startOfDay } from "date-fns";
import type { ProblemStatusType, ReminderStageType } from "@/lib/types/enums";

/**
 * Problem State Machine
 * 
 * Handles state transitions for problems based on user actions.
 * Implements the spaced repetition system with state validation.
 * 
 * State Machine Rules:
 * - Only mastered problems are excluded from "due today" view
 * - Failed problems always appear in separate "Failed" section
 * - Failed problems reset to day_3 regardless of previous stage
 * - Failure counter persists forever (accountability metric)
 */

export interface ProblemStateUpdate {
  status: ProblemStatusType;
  reminderStage: ReminderStageType;
  nextReminderDate: Date;
  failureCount?: number;
  totalAttempts: number;
  lastAttemptedAt: Date;
}

export interface ProblemInput {
  reminderStage: ReminderStageType;
  totalAttempts: number;
  failureCount?: number;
  status?: ProblemStatusType;
}

/**
 * Validation error for state machine operations
 */
export class StateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StateMachineError";
  }
}

/**
 * Validate that a reminder stage is valid
 */
export function isValidReminderStage(
  stage: string
): stage is ReminderStageType {
  return ["day_3", "day_10", "day_30", "completed"].includes(stage);
}

/**
 * Validate that a problem status is valid
 */
export function isValidProblemStatus(
  status: string
): status is ProblemStatusType {
  return ["fresh", "active", "failed", "mastered"].includes(status);
}

/**
 * Validate that a date calculation is correct
 * Ensures the date is in the future (or today) and properly calculated
 */
export function validateDateCalculation(
  calculatedDate: Date,
  expectedDays: number,
  baseDate: Date = new Date()
): boolean {
  const expectedDate = addDays(startOfDay(baseDate), expectedDays);
  const calculatedStartOfDay = startOfDay(calculatedDate);

  // Allow 1 second tolerance for time calculations
  const diff = Math.abs(
    calculatedStartOfDay.getTime() - expectedDate.getTime()
  );
  return diff < 1000; // 1 second tolerance
}

/**
 * Validate state transition is legal
 * 
 * Legal transitions:
 * - day_3 → day_10 (when solved)
 * - day_10 → day_30 (when solved)
 * - day_30 → completed (when solved)
 * - Any stage → day_3 (when failed)
 * 
 * @param fromStage - Current reminder stage
 * @param toStage - Target reminder stage
 * @param isSolved - Whether the transition is for a solved problem
 * @returns true if transition is legal, false otherwise
 */
export function validateStateTransition(
  fromStage: ReminderStageType,
  toStage: ReminderStageType,
  isSolved: boolean
): boolean {
  if (isSolved) {
    // Solved transitions
    const validSolvedTransitions: Record<ReminderStageType, ReminderStageType[]> =
      {
        day_3: ["day_10"],
        day_10: ["day_30"],
        day_30: ["completed"],
        completed: ["completed"], // Can stay completed
      };

    return validSolvedTransitions[fromStage]?.includes(toStage) ?? false;
  } else {
    // Failed always resets to day_3
    return toStage === "day_3";
  }
}

/**
 * Validate that status and reminder stage are consistent
 * 
 * Valid combinations:
 * - fresh + day_3
 * - active + day_10 or day_30
 * - failed + day_3
 * - mastered + completed
 * 
 * @param status - Problem status
 * @param reminderStage - Reminder stage
 * @returns true if status and stage are consistent, false otherwise
 */
export function validateStatusStageConsistency(
  status: ProblemStatusType,
  reminderStage: ReminderStageType
): boolean {
  const validCombinations: Record<ProblemStatusType, ReminderStageType[]> = {
    fresh: ["day_3"],
    active: ["day_10", "day_30"],
    failed: ["day_3"],
    mastered: ["completed"],
  };

  return validCombinations[status]?.includes(reminderStage) ?? false;
}

/**
 * Validate that date calculations are correct for specific reminder stages
 * 
 * Expected days:
 * - day_3: +3 days
 * - day_10: +10 days
 * - day_30: +30 days
 * - completed: 0 days (today, can be in the past)
 * 
 * @param reminderStage - Reminder stage
 * @param calculatedDate - Calculated next reminder date
 * @param baseDate - Base date for calculation
 * @returns true if date calculation is correct, false otherwise
 */
export function validateReminderDateForStage(
  reminderStage: ReminderStageType,
  calculatedDate: Date,
  baseDate: Date = new Date()
): boolean {
  const expectedDaysMap: Record<ReminderStageType, number> = {
    day_3: 3,
    day_10: 10,
    day_30: 30,
    completed: 0, // Completed problems have nextReminderDate set to today (when mastered)
  };

  const expectedDays = expectedDaysMap[reminderStage];
  if (expectedDays === undefined) {
    return false;
  }

  // For completed stage, allow the date to be today or in the past
  if (reminderStage === "completed") {
    const expectedDate = startOfDay(baseDate);
    const calculatedStartOfDay = startOfDay(calculatedDate);
    // Allow completed dates to be today or in the past (not future)
    return calculatedStartOfDay.getTime() <= expectedDate.getTime() + 86400000; // +1 day tolerance
  }

  return validateDateCalculation(calculatedDate, expectedDays, baseDate);
}

/**
 * Validate a complete problem state update
 * 
 * Validates:
 * - Status and reminder stage consistency
 * - Date calculation correctness
 * - State transition legality (if fromState provided)
 * - Numeric values are valid (non-negative)
 * 
 * @param update - Problem state update to validate
 * @param fromState - Optional previous state for transition validation
 * @param isSolved - Whether this is a solved transition (for transition validation)
 * @param baseDate - Optional base date used for date calculation (defaults to current date)
 * @returns Object with isValid flag and optional error message
 */
export function validateProblemStateUpdate(
  update: ProblemStateUpdate,
  fromState?: { reminderStage: ReminderStageType; status?: ProblemStatusType },
  isSolved?: boolean,
  baseDate?: Date
): { isValid: boolean; error?: string } {
  // Validate status and stage consistency
  if (!validateStatusStageConsistency(update.status, update.reminderStage)) {
    return {
      isValid: false,
      error: `Invalid status/stage combination: ${update.status} + ${update.reminderStage}`,
    };
  }

  // Validate date calculation for the reminder stage
  const validationBaseDate = baseDate || update.lastAttemptedAt || new Date();
  if (!validateReminderDateForStage(update.reminderStage, update.nextReminderDate, validationBaseDate)) {
    return {
      isValid: false,
      error: `Invalid date calculation for stage ${update.reminderStage}`,
    };
  }

  // Validate numeric values
  if (update.totalAttempts < 0) {
    return {
      isValid: false,
      error: `Invalid totalAttempts: ${update.totalAttempts} (must be >= 0)`,
    };
  }

  if (update.failureCount !== undefined && update.failureCount < 0) {
    return {
      isValid: false,
      error: `Invalid failureCount: ${update.failureCount} (must be >= 0)`,
    };
  }

  // Validate state transition if fromState provided
  if (fromState && isSolved !== undefined) {
    if (
      !validateStateTransition(
        fromState.reminderStage,
        update.reminderStage,
        isSolved
      )
    ) {
      return {
        isValid: false,
        error: `Illegal state transition: ${fromState.reminderStage} → ${update.reminderStage} (${isSolved ? "solved" : "failed"})`,
      };
    }
  }

  return { isValid: true };
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
 * 
 * @param problem - Problem with reminderStage and totalAttempts
 * @param currentDate - Current date (defaults to now)
 * @returns ProblemStateUpdate with new state
 * @throws StateMachineError if reminder stage is invalid
 */
export function markProblemSolved(
  problem: ProblemInput,
  currentDate: Date = new Date()
): ProblemStateUpdate {
  // Validate input
  if (!isValidReminderStage(problem.reminderStage)) {
    throw new StateMachineError(
      `Invalid reminder stage: ${problem.reminderStage}`
    );
  }

  if (typeof problem.totalAttempts !== "number" || problem.totalAttempts < 0) {
    throw new StateMachineError(
      `Invalid totalAttempts: ${problem.totalAttempts}`
    );
  }

  const totalAttempts = problem.totalAttempts + 1;
  const lastAttemptedAt = currentDate;
  const baseDate = startOfDay(currentDate);

  let update: ProblemStateUpdate;

  switch (problem.reminderStage) {
    case "day_3": {
      const nextReminderDate = addDays(baseDate, 10);
      update = {
        status: "active",
        reminderStage: "day_10",
        nextReminderDate,
        totalAttempts,
        lastAttemptedAt,
      };

      // Validate date calculation
      if (!validateDateCalculation(nextReminderDate, 10, baseDate)) {
        throw new StateMachineError(
          "Date calculation error: day_3 → day_10 should be +10 days"
        );
      }
      break;
    }

    case "day_10": {
      const nextReminderDate = addDays(baseDate, 30);
      update = {
        status: "active",
        reminderStage: "day_30",
        nextReminderDate,
        totalAttempts,
        lastAttemptedAt,
      };

      // Validate date calculation
      if (!validateDateCalculation(nextReminderDate, 30, baseDate)) {
        throw new StateMachineError(
          "Date calculation error: day_10 → day_30 should be +30 days"
        );
      }
      break;
    }

    case "day_30": {
      // When mastered, set next_reminder_date to today
      update = {
        status: "mastered",
        reminderStage: "completed",
        nextReminderDate: baseDate,
        totalAttempts,
        lastAttemptedAt,
      };
      break;
    }

    case "completed": {
      // Already completed, no transition needed but still increment attempts
      update = {
        status: "mastered",
        reminderStage: "completed",
        nextReminderDate: baseDate,
        totalAttempts,
        lastAttemptedAt,
      };
      break;
    }

    default:
      throw new StateMachineError(
        `Invalid reminder stage: ${problem.reminderStage}`
      );
  }

  // Validate state transition
  if (
    !validateStateTransition(
      problem.reminderStage,
      update.reminderStage,
      true
    )
  ) {
    throw new StateMachineError(
      `Illegal state transition: ${problem.reminderStage} → ${update.reminderStage} (solved)`
    );
  }

  // Comprehensive validation of the complete state update
  const validation = validateProblemStateUpdate(update, problem, true, baseDate);
  if (!validation.isValid) {
    throw new StateMachineError(validation.error || "Invalid state update");
  }

  return update;
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
 * 
 * Note: Failed problems reset to day_3 regardless of previous stage.
 * Failure counter persists forever (accountability metric).
 * 
 * @param problem - Problem with failureCount and totalAttempts
 * @param currentDate - Current date (defaults to now)
 * @returns ProblemStateUpdate with new state
 * @throws StateMachineError if input is invalid
 */
export function markProblemFailed(
  problem: ProblemInput,
  currentDate: Date = new Date()
): ProblemStateUpdate {
  // Validate input
  const failureCount = (problem.failureCount ?? 0) + 1;
  if (typeof problem.totalAttempts !== "number" || problem.totalAttempts < 0) {
    throw new StateMachineError(
      `Invalid totalAttempts: ${problem.totalAttempts}`
    );
  }

  if (failureCount < 1) {
    throw new StateMachineError(`Invalid failureCount: ${failureCount}`);
  }

  const totalAttempts = problem.totalAttempts + 1;
  const lastAttemptedAt = currentDate;
  const baseDate = startOfDay(currentDate);
  const nextReminderDate = addDays(baseDate, 3);

  // Validate date calculation
  if (!validateDateCalculation(nextReminderDate, 3, baseDate)) {
    throw new StateMachineError(
      "Date calculation error: failed reset should be +3 days"
    );
  }

  const update: ProblemStateUpdate = {
    status: "failed",
    reminderStage: "day_3",
    nextReminderDate,
    failureCount,
    totalAttempts,
    lastAttemptedAt,
  };

  // Validate state transition (failed always goes to day_3)
  const fromStage = problem.reminderStage || "day_3";
  if (!validateStateTransition(fromStage, update.reminderStage, false)) {
    throw new StateMachineError(
      `Illegal state transition: ${fromStage} → ${update.reminderStage} (failed)`
    );
  }

  // Comprehensive validation of the complete state update
  const validation = validateProblemStateUpdate(update, problem, false, baseDate);
  if (!validation.isValid) {
    throw new StateMachineError(validation.error || "Invalid state update");
  }

  return update;
}

/**
 * Get the initial state for a new problem
 * 
 * Initial state when problem is added:
 * - status: 'fresh'
 * - reminder_stage: 'day_3'
 * - next_reminder_date: today + 3 days
 * - failure_count: 0
 * - total_attempts: 0
 * 
 * @param currentDate - Current date (defaults to now)
 * @returns ProblemStateUpdate with initial state
 */
export function getInitialProblemState(
  currentDate: Date = new Date()
): Omit<ProblemStateUpdate, "lastAttemptedAt"> {
  const baseDate = startOfDay(currentDate);
  const nextReminderDate = addDays(baseDate, 3);

  // Validate date calculation
  if (!validateDateCalculation(nextReminderDate, 3, baseDate)) {
    throw new StateMachineError(
      "Date calculation error: initial state should be +3 days"
    );
  }

  const initialState = {
    status: "fresh" as const,
    reminderStage: "day_3" as const,
    nextReminderDate,
    failureCount: 0,
    totalAttempts: 0,
  };

  // Validate the initial state (without lastAttemptedAt)
  // Create a temporary full state for validation
  const tempState: ProblemStateUpdate = {
    ...initialState,
    lastAttemptedAt: currentDate,
  };

  const validation = validateProblemStateUpdate(tempState, undefined, undefined, baseDate);
  if (!validation.isValid) {
    throw new StateMachineError(
      validation.error || "Invalid initial state"
    );
  }

  return initialState;
}
