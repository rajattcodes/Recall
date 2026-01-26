import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";

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
      },
      orderBy: {
        nextReminderDate: "asc",
      },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error("Error fetching due problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch due problems" },
      { status: 500 }
    );
  }
}
