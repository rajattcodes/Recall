/**
 * API Response Types
 * Shared types for API responses and frontend components
 */

import { ProblemStatusType, ReminderStageType } from "./enums";

/**
 * Canonical Pattern type from the database
 */
export interface CanonicalPattern {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

/**
 * Custom Pattern type from the database with relation
 */
export interface CustomPattern {
  id: string;
  userId: string;
  name: string;
  canonicalPatternId: string;
  createdAt: string;
  canonicalPattern?: CanonicalPattern;
}

/**
 * Problem type from the database with relations
 */
export interface Problem {
  id: string;
  userId: string;
  title: string;
  leetcodeUrl: string;
  canonicalPatternId: string;
  customPatternId: string | null;
  status: ProblemStatusType;
  reminderStage: ReminderStageType;
  nextReminderDate: string;
  failureCount: number;
  totalAttempts: number;
  createdAt: string;
  lastAttemptedAt: string | null;
  canonicalPattern: CanonicalPattern;
  customPattern: CustomPattern | null;
  attemptHistory?: AttemptHistory[];
  failureNotes?: string[] | null;
}

/**
 * Pattern Overview response type for aggregated pattern data
 */
export interface PatternOverview {
  canonical_pattern: CanonicalPattern;
  total_problems: number;
  due_count: number;
  failed_count: number;
}

/**
 * Create Problem request body
 */
export interface CreateProblemRequest {
  title: string;
  leetcodeUrl: string;
  canonicalPatternId: string;
  customPatternId?: string | null;
}

/**
 * Create Custom Pattern request body
 */
export interface CreateCustomPatternRequest {
  name: string;
  canonicalPatternId: string;
}

/**
 * Attempt History entry
 */
export interface AttemptHistory {
  id: string;
  problemId: string;
  attemptedAt: string;
  result: "solved" | "failed";
  notes: string | null;
}

/**
 * Mark Problem request body
 */
export interface MarkProblemRequest {
  result: "solved" | "failed";
  failureNotes?: string[];
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  error: string;
  details?: string | string[];
  code?: string;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiErrorResponse;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
