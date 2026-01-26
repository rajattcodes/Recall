import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";

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

    return NextResponse.json(problems);
  } catch (error) {
    console.error("Error fetching failed problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch failed problems" },
      { status: 500 }
    );
  }
}
