import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { markProblemSolved, markProblemFailed } from "@/features/problems/lib/state-machine";
import { z, ZodError } from "zod";

/**
 * PATCH /api/problems/[id]/mark
 * 
 * Marks a problem as solved or failed and applies state transition.
 * Creates attempt_history record.
 * 
 * Body: { result: 'solved' | 'failed' }
 */
const markProblemSchema = z.object({
  result: z.enum(["solved", "failed"]),
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

    // Validate input
    const validatedData = markProblemSchema.parse(body);

    // Fetch the problem and verify ownership
    const problem = await prisma.problem.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found or does not belong to user" },
        { status: 404 }
      );
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
        },
      }),
    ]);

    return NextResponse.json(updatedProblem);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error marking problem:", error);
    return NextResponse.json(
      { error: "Failed to mark problem" },
      { status: 500 }
    );
  }
}
