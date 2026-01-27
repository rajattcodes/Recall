import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { z } from "zod";
import { handleApiError, createNotFoundError, createConflictError } from "@/lib/api-errors";

/**
 * GET /api/patterns/custom
 * 
 * Returns user's custom patterns with canonical_pattern relation
 * Order by: name ASC
 */
export async function GET() {
  try {
    const userIdOrResponse = await requireUserIdApi();
    if (userIdOrResponse instanceof NextResponse) {
      return userIdOrResponse;
    }
    const userId = userIdOrResponse;

    const patterns = await prisma.customPattern.findMany({
      where: {
        userId,
      },
      include: {
        canonicalPattern: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(patterns);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/patterns/custom
 * 
 * Creates a new custom pattern for the authenticated user
 * Body: { name, canonicalPatternId }
 * 
 * Validates:
 * - name: string, min 1 character, required
 * - canonicalPatternId: string, required
 * 
 * Enforces unique constraint: UNIQUE(userId, name)
 */
const createCustomPatternSchema = z.object({
  name: z
    .string()
    .min(1, "Pattern name is required and must be at least 1 character")
    .max(100, "Pattern name must be less than 100 characters"),
  canonicalPatternId: z
    .string()
    .min(1, "Canonical pattern is required - please select a canonical pattern"),
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
    const validatedData = createCustomPatternSchema.parse(body);

    // Verify canonical pattern exists
    const canonicalPattern = await prisma.canonicalPattern.findUnique({
      where: { id: validatedData.canonicalPatternId },
    });

    if (!canonicalPattern) {
      return createNotFoundError("Canonical pattern");
    }

    // Create custom pattern
    // Prisma will throw P2002 if unique constraint is violated
    try {
      const customPattern = await prisma.customPattern.create({
        data: {
          userId,
          name: validatedData.name,
          canonicalPatternId: validatedData.canonicalPatternId,
        },
        include: {
          canonicalPattern: true,
        },
      });

      return NextResponse.json(customPattern, { status: 201 });
    } catch (error: any) {
      // Handle Prisma unique constraint violation
      if (error.code === "P2002") {
        return createConflictError("A custom pattern with this name already exists");
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
