import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-errors";
import { enrichProblemWithFailureNote } from "@/lib/problems/failure-notes";

/**
 * GET /api/problems/failed
 * 
 * Returns problems where status == 'failed'
 * Includes: canonical_pattern, custom_pattern
 * Order by: failure_count DESC, last_attempted_at DESC
 */
export async function GET() {
  try {
    const userIdOrResponse = await requireUserIdApi();
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;

    const problems = await prisma.problem.findMany({
      where: {
        userId,
        status: "failed",
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
      orderBy: [
        {
          failureCount: "desc",
        },
        {
          lastAttemptedAt: "desc",
        },
      ],
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
