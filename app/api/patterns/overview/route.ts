import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-errors";

/**
 * GET /api/patterns/overview
 * 
 * Aggregation query grouping problems by canonical_pattern_id
 * Returns array of objects with:
 * - canonical_pattern: Full canonical pattern object
 * - total_problems: Count of all user's problems for this pattern
 * - due_count: Count of problems where next_reminder_date <= today AND status != 'mastered'
 * - failed_count: Count of problems where status == 'failed'
 */
export async function GET() {
  try {
    const userIdOrResponse = await requireUserIdApi();
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;

    // Get all canonical patterns
    const canonicalPatterns = await prisma.canonicalPattern.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Get today's date (end of day)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Aggregate data for each canonical pattern
    const overview = await Promise.all(
      canonicalPatterns.map(async (canonicalPattern) => {
        // Count total problems for this pattern
        const totalProblems = await prisma.problem.count({
          where: {
            userId,
            canonicalPatternId: canonicalPattern.id,
          },
        });

        // Count due problems (next_reminder_date <= today AND status != 'mastered')
        const dueCount = await prisma.problem.count({
          where: {
            userId,
            canonicalPatternId: canonicalPattern.id,
            nextReminderDate: {
              lte: today,
            },
            status: {
              not: "mastered",
            },
          },
        });

        // Count failed problems
        const failedCount = await prisma.problem.count({
          where: {
            userId,
            canonicalPatternId: canonicalPattern.id,
            status: "failed",
          },
        });

        return {
          canonical_pattern: canonicalPattern,
          total_problems: totalProblems,
          due_count: dueCount,
          failed_count: failedCount,
        };
      })
    );

    return NextResponse.json(overview);
  } catch (error) {
    return handleApiError(error);
  }
}
