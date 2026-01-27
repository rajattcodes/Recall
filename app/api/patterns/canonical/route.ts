import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-errors";

/**
 * GET /api/patterns/canonical
 * 
 * Returns all canonical patterns from the database
 * Order by: name ASC
 * No authentication required (public data)
 */
export async function GET() {
  try {
    const patterns = await prisma.canonicalPattern.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(patterns);
  } catch (error) {
    return handleApiError(error);
  }
}
