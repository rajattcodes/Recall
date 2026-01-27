import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import type { Problem } from "@/lib/types/api";

const getTodayDate = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

export const getDueProblems = cache(async (): Promise<Problem[]> => {
  const userId = await requireUserId();
  const today = getTodayDate();

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

  return problems;
});

export const getFailedProblems = cache(async (): Promise<Problem[]> => {
  const userId = await requireUserId();

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

  return problems;
});

export const getDueAndFailedProblems = cache(async () => {
  const [dueProblems, failedProblems] = await Promise.all([
    getDueProblems(),
    getFailedProblems(),
  ]);

  return {
    dueProblems,
    failedProblems,
  };
});

export const getProblemsForPattern = cache(
  async (canonicalPatternId: string): Promise<Problem[]> => {
    const userId = await requireUserId();
    const problems = await prisma.problem.findMany({
      where: {
        userId,
        canonicalPatternId,
      },
      include: {
        canonicalPattern: true,
        customPattern: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return problems;
  }
);
