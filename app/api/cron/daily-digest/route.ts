import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyDigest } from "@/lib/email";

/**
 * GET /api/cron/daily-digest
 * 
 * Cron endpoint for sending daily digest emails to all users
 * 
 * Authentication: Requires Bearer token matching CRON_SECRET in Authorization header
 * 
 * Action:
 * 1. Verify CRON_SECRET
 * 2. Fetch all users who have problems
 * 3. For each user, fetch their due and failed problems
 * 4. If both counts are 0, skip email
 * 5. Send email via Resend
 * 
 * Returns: { success, dueCount, failedCount, emailsSent }
 */
export async function GET(request: Request) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (token !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid cron secret" },
        { status: 401 }
      );
    }

    // Get today's date (end of day)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get all unique user IDs who have problems using groupBy
    const userGroups = await prisma.problem.groupBy({
      by: ["userId"],
    });

    if (userGroups.length === 0) {
      return NextResponse.json({
        success: true,
        dueCount: 0,
        failedCount: 0,
        emailsSent: 0,
        message: "No users with problems found",
      });
    }

    // Get user details for those user IDs
    const userIds = userGroups.map((g) => g.userId);
    const usersWithProblems = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (usersWithProblems.length === 0) {
      return NextResponse.json({
        success: true,
        dueCount: 0,
        failedCount: 0,
        emailsSent: 0,
        message: "No users with problems found",
      });
    }

    let totalDueCount = 0;
    let totalFailedCount = 0;
    let emailsSent = 0;
    const errors: string[] = [];

    // Process each user
    for (const user of usersWithProblems) {
      try {
        // Fetch due problems for this user
        const dueProblems = await prisma.problem.findMany({
          where: {
            userId: user.id,
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

        // Fetch failed problems for this user
        const failedProblems = await prisma.problem.findMany({
          where: {
            userId: user.id,
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

        const dueCount = dueProblems.length;
        const failedCount = failedProblems.length;

        totalDueCount += dueCount;
        totalFailedCount += failedCount;

        // Skip email if no problems
        if (dueCount === 0 && failedCount === 0) {
          continue;
        }

        // Send email
        const result = await sendDailyDigest(
          user.email,
          dueProblems,
          failedProblems
        );

        if (result.success) {
          emailsSent++;
        } else {
          errors.push(
            `Failed to send email to ${user.email}: ${result.error || "Unknown error"}`
          );
        }
      } catch (error: any) {
        console.error(`Error processing user ${user.id}:`, error);
        errors.push(`Error processing user ${user.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      dueCount: totalDueCount,
      failedCount: totalFailedCount,
      emailsSent,
      usersProcessed: usersWithProblems.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in daily digest cron:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process daily digest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
