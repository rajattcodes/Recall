import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import type {
  CanonicalPattern,
  CustomPattern,
  PatternOverview,
} from "@/lib/types/api";

const getTodayDate = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

export const getCanonicalPatterns = cache(async (): Promise<CanonicalPattern[]> => {
  const patterns = await prisma.canonicalPattern.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return patterns;
});

export const getCanonicalPatternById = cache(
  async (id: string): Promise<CanonicalPattern | null> => {
    const pattern = await prisma.canonicalPattern.findUnique({
      where: { id },
    });
    return pattern;
  }
);

export const getCustomPatterns = cache(async (): Promise<CustomPattern[]> => {
  const userId = await requireUserId();

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

  return patterns;
});

export const getPatterns = cache(async () => {
  const [canonicalPatterns, customPatterns] = await Promise.all([
    getCanonicalPatterns(),
    getCustomPatterns(),
  ]);

  return {
    canonicalPatterns,
    customPatterns,
  };
});

export const getPatternsOverview = cache(async (): Promise<PatternOverview[]> => {
  const userId = await requireUserId();
  const today = getTodayDate();

  const canonicalPatterns = await prisma.canonicalPattern.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const overview = await Promise.all(
    canonicalPatterns.map(async (canonicalPattern) => {
      const [totalProblems, dueCount, failedCount] = await Promise.all([
        prisma.problem.count({
          where: {
            userId,
            canonicalPatternId: canonicalPattern.id,
          },
        }),
        prisma.problem.count({
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
        }),
        prisma.problem.count({
          where: {
            userId,
            canonicalPatternId: canonicalPattern.id,
            status: "failed",
          },
        }),
      ]);

      return {
        canonical_pattern: canonicalPattern,
        total_problems: totalProblems,
        due_count: dueCount,
        failed_count: failedCount,
      };
    })
  );

  return overview;
});
