import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { addDays } from "date-fns";
import { z } from "zod";
import { handleApiError, createNotFoundError } from "@/lib/api-errors";

/**
 * GET /api/problems
 *
 * Returns all problems for user. Optional ?canonicalPatternId=<id> filters by pattern.
 * Includes: canonical_pattern, custom_pattern. Order by: created_at DESC.
 */
export async function GET(request: Request) {
  try {
    const userIdOrResponse = await requireUserIdApi();
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;

    const { searchParams } = new URL(request.url);
    const canonicalPatternId = searchParams.get("canonicalPatternId");

    const where: { userId: string; canonicalPatternId?: string } = { userId };
    if (canonicalPatternId) {
      where.canonicalPatternId = canonicalPatternId;
    }

    const problems = await prisma.problem.findMany({
      where,
      include: {
        canonicalPattern: true,
        customPattern: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(problems);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/problems
 * 
 * Creates a new problem with initial state:
 * - status: 'fresh'
 * - reminder_stage: 'day_3'
 * - next_reminder_date: today + 3 days
 * - failure_count: 0
 * - total_attempts: 0
 * 
 * Body: { title, leetcodeUrl, canonicalPatternId, customPatternId? }
 */
const createProblemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required and must be at least 1 character"),
  leetcodeUrl: z
    .string()
    .min(1, "LeetCode URL is required")
    .url("Please provide a valid LeetCode URL (e.g., https://leetcode.com/problems/...)"),
  canonicalPatternId: z
    .string()
    .min(1, "Canonical pattern is required - please select a pattern"),
  customPatternId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const userIdOrResponse = await requireUserIdApi();
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;
    const body = await request.json();

    // Validate input
    const validatedData = createProblemSchema.parse(body);

    // Verify canonical pattern exists
    const canonicalPattern = await prisma.canonicalPattern.findUnique({
      where: { id: validatedData.canonicalPatternId },
    });

    if (!canonicalPattern) {
      return createNotFoundError("Canonical pattern");
    }

    // Verify custom pattern exists and belongs to user (if provided)
    if (validatedData.customPatternId) {
      const customPattern = await prisma.customPattern.findFirst({
        where: {
          id: validatedData.customPatternId,
          userId,
        },
      });

      if (!customPattern) {
        return createNotFoundError("Custom pattern");
      }
    }

    // Create problem with initial state
    const today = new Date();
    const problem = await prisma.problem.create({
      data: {
        userId,
        title: validatedData.title,
        leetcodeUrl: validatedData.leetcodeUrl,
        canonicalPatternId: validatedData.canonicalPatternId,
        customPatternId: validatedData.customPatternId || null,
        status: "fresh",
        reminderStage: "day_3",
        nextReminderDate: addDays(today, 3),
        failureCount: 0,
        totalAttempts: 0,
      },
      include: {
        canonicalPattern: true,
        customPattern: true,
      },
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
