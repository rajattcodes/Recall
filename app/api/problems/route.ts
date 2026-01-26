import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { addDays } from "date-fns";
import { z, ZodError } from "zod";

/**
 * GET /api/problems
 * 
 * Returns all problems for user
 * Includes: canonical_pattern, custom_pattern
 * Order by: created_at DESC
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
      },
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
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
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
  title: z.string().min(1, "Title is required"),
  leetcodeUrl: z.string().url("Invalid LeetCode URL"),
  canonicalPatternId: z.string().min(1, "Canonical pattern is required"),
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
      return NextResponse.json(
        { error: "Canonical pattern not found" },
        { status: 404 }
      );
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
        return NextResponse.json(
          { error: "Custom pattern not found or does not belong to user" },
          { status: 404 }
        );
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}
