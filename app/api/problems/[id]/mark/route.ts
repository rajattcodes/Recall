import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import {
  markProblemSolved,
  markProblemFailed,
  StateMachineError,
} from "@/features/problems/lib/state-machine";
import { z } from "zod";
import {
  handleApiError,
  createNotFoundError,
  createValidationError,
} from "@/lib/api-errors";
import { validateFailureNotes } from "@/lib/validation/failure-notes";
import { serializeFailureNotes } from "@/lib/validation/parse-failure-notes";
import { enrichProblemWithFailureNote } from "@/lib/problems/failure-notes";
import type { Problem } from "@/lib/types/api";

/**
 * PATCH /api/problems/[id]/mark
 * 
 * Marks a problem as solved or failed and applies state transition.
 * Creates attempt_history record.
 * 
 * Body: { result: 'solved' | 'failed', failureNotes?: string[] }
 * - failureNotes only valid when result === 'failed'
 */
const markProblemSchema = z.object({
  result: z.enum(["solved", "failed"]),
  failureNotes: z.array(z.string()).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrResponse = await requireUserIdApi();
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;
    const { id } = await params;
    const body = await request.json();

    // Validate input schema
    const validatedData = markProblemSchema.parse(body);

    // Validate failureNotes if provided
    if (validatedData.result === "failed" && validatedData.failureNotes !== undefined) {
      const validation = validateFailureNotes(validatedData.failureNotes);
      if (!validation.isValid) {
        return createValidationError(
          validation.error || "Invalid failure notes"
        );
      }
    }

    // Reject failureNotes when result is "solved"
    if (validatedData.result === "solved" && validatedData.failureNotes !== undefined) {
      return createValidationError(
        "failureNotes can only be provided when result is 'failed'"
      );
    }

    // Fetch the problem and verify ownership
    const problem = await prisma.problem.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!problem) {
      return createNotFoundError("Problem");
    }

    // Apply state transition based on result
    const currentDate = new Date();
    let updateData: {
      status: "fresh" | "active" | "failed" | "mastered";
      reminderStage: "day_3" | "day_10" | "day_30" | "completed";
      nextReminderDate: Date;
      failureCount?: number;
      totalAttempts: number;
      lastAttemptedAt: Date;
    };

    if (validatedData.result === "solved") {
      const stateUpdate = markProblemSolved(problem, currentDate);
      updateData = {
        status: stateUpdate.status,
        reminderStage: stateUpdate.reminderStage,
        nextReminderDate: stateUpdate.nextReminderDate,
        totalAttempts: stateUpdate.totalAttempts,
        lastAttemptedAt: stateUpdate.lastAttemptedAt,
      };
    } else {
      const stateUpdate = markProblemFailed(problem, currentDate);
      updateData = {
        status: stateUpdate.status,
        reminderStage: stateUpdate.reminderStage,
        nextReminderDate: stateUpdate.nextReminderDate,
        failureCount: stateUpdate.failureCount,
        totalAttempts: stateUpdate.totalAttempts,
        lastAttemptedAt: stateUpdate.lastAttemptedAt,
      };
    }

    // Serialize failure notes if provided
    const notesString =
      validatedData.result === "failed"
        ? serializeFailureNotes(validatedData.failureNotes)
        : null;

    // Update problem and create attempt history in a transaction
    const [updatedProblem] = await prisma.$transaction([
      prisma.problem.update({
        where: { id },
        data: updateData,
        include: {
          canonicalPattern: true,
          customPattern: true,
        },
      }),
      prisma.attemptHistory.create({
        data: {
          problemId: id,
          result: validatedData.result,
          attemptedAt: currentDate,
          notes: notesString,
        },
      }),
    ]);

    // Fetch attempt history for response
    const attemptHistory = await prisma.attemptHistory.findMany({
      where: { problemId: id },
      orderBy: { attemptedAt: "desc" },
    });

    const problemWithHistory: Problem = {
      id: updatedProblem.id,
      userId: updatedProblem.userId,
      title: updatedProblem.title,
      leetcodeUrl: updatedProblem.leetcodeUrl,
      canonicalPatternId: updatedProblem.canonicalPatternId,
      customPatternId: updatedProblem.customPatternId,
      status: updatedProblem.status,
      reminderStage: updatedProblem.reminderStage,
      nextReminderDate: updatedProblem.nextReminderDate.toISOString(),
      failureCount: updatedProblem.failureCount,
      totalAttempts: updatedProblem.totalAttempts,
      createdAt: updatedProblem.createdAt.toISOString(),
      lastAttemptedAt: updatedProblem.lastAttemptedAt?.toISOString() ?? null,
      canonicalPattern: {
        ...updatedProblem.canonicalPattern,
        createdAt: updatedProblem.canonicalPattern.createdAt.toISOString(),
      },
      customPattern: updatedProblem.customPattern
        ? {
            ...updatedProblem.customPattern,
            createdAt: updatedProblem.customPattern.createdAt.toISOString(),
          }
        : null,
      attemptHistory: attemptHistory.map((attempt) => ({
        id: attempt.id,
        problemId: attempt.problemId,
        attemptedAt: attempt.attemptedAt.toISOString(),
        result: attempt.result,
        notes: attempt.notes,
      })),
    };

    const enrichedProblem = enrichProblemWithFailureNote(problemWithHistory);

    return NextResponse.json(enrichedProblem);
  } catch (error) {
    if (error instanceof StateMachineError) {
      return handleApiError(
        new Error(`Invalid state transition: ${error.message}`)
      );
    }
    return handleApiError(error);
  }
}
