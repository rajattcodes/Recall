import type { Problem, AttemptHistory } from "@/lib/types/api";
import { parseFailureNotes } from "@/lib/validation/parse-failure-notes";

/**
 * Get the latest failure note from a problem's attempt history
 * 
 * Behavior:
 * - Searches backwards through attemptHistory (most recent first)
 * - Finds most recent failed attempt with non-null notes
 * - If latest failed attempt has no notes, preserves previous note-with-content
 * - Returns null if no valid failure note exists
 * 
 * This preserves valuable diagnostic information even if user skips notes
 * on subsequent failures.
 */
export function getLatestFailureNote(
  problem: Problem
): string[] | null {
  if (!problem.attemptHistory || problem.attemptHistory.length === 0) {
    return null;
  }

  const sortedHistory = [...problem.attemptHistory].sort(
    (a, b) =>
      new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
  );

  for (const attempt of sortedHistory) {
    if (attempt.result === "failed" && attempt.notes) {
      const parsed = parseFailureNotes(attempt.notes);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
  }

  return null;
}

/**
 * Enrich a problem with its latest failure note
 * 
 * Adds computed `failureNotes` field to problem object.
 * Used by API routes before returning problem data.
 */
export function enrichProblemWithFailureNote(
  problem: Problem
): Problem & { failureNotes: string[] | null } {
  return {
    ...problem,
    failureNotes: getLatestFailureNote(problem),
  };
}
