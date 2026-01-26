import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserIdApi } from "@/lib/auth-helpers";
import { z, ZodError } from "zod";

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
    console.error("Error fetching custom patterns:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom patterns" },
      { status: 500 }
    );
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
  name: z.string().min(1, "Name is required"),
  canonicalPatternId: z.string().min(1, "Canonical pattern is required"),
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
      return NextResponse.json(
        { error: "Canonical pattern not found" },
        { status: 404 }
      );
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
        return NextResponse.json(
          { error: "A custom pattern with this name already exists" },
          { status: 409 }
        );
      }
      throw error; // Re-throw if it's a different error
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error creating custom pattern:", error);
    return NextResponse.json(
      { error: "Failed to create custom pattern" },
      { status: 500 }
    );
  }
}
