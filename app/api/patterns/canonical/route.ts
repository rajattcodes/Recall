import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    console.error("Error fetching canonical patterns:", error);
    return NextResponse.json(
      { error: "Failed to fetch canonical patterns" },
      { status: 500 }
    );
  }
}
