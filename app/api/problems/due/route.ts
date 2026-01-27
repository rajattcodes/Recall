import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-errors";
import { enrichProblemWithFailureNote } from "@/lib/problems/failure-notes";

/**
 * GET /api/problems/due
 * 
 * Returns problems where next_reminder_date <= today AND status != 'mastered'
 * Includes: canonical_pattern, custom_pattern (if exists)
 * Order by: next_reminder_date ASC
 */
export async function GET() {
  try {
    const userIdOrResponse = await requireUserIdApi();
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today (include all of today)

    const problems = await prisma.problem.findMany({
      where: {
        userId,
        nextReminderDate: {
          lte: today,
        },
        status: {
          not: "mastered",
        },
      },
      include: {
        canonicalPattern: true,
        customPattern: true,
        attemptHistory: {
          orderBy: {
            attemptedAt: "desc",
          },
        },
      },
      orderBy: {
        nextReminderDate: "asc",
      },
    });

    const enrichedProblems = problems.map((problem) => {
      const problemWithDates = {
        ...problem,
        nextReminderDate: problem.nextReminderDate.toISOString(),
        createdAt: problem.createdAt.toISOString(),
        lastAttemptedAt: problem.lastAttemptedAt?.toISOString() ?? null,
        canonicalPattern: {
          ...problem.canonicalPattern,
          createdAt: problem.canonicalPattern.createdAt.toISOString(),
        },
        customPattern: problem.customPattern
          ? {
              ...problem.customPattern,
              createdAt: problem.customPattern.createdAt.toISOString(),
            }
          : null,
        attemptHistory: problem.attemptHistory.map((attempt) => ({
          ...attempt,
          attemptedAt: attempt.attemptedAt.toISOString(),
        })),
      };
      return enrichProblemWithFailureNote(problemWithDates);
    });

    return NextResponse.json(enrichedProblems);
  } catch (error) {
    return handleApiError(error);
  }
}
