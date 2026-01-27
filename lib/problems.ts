import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import type { Problem } from "@/lib/types/api";
import { enrichProblemWithFailureNote } from "@/lib/problems/failure-notes";

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
      attemptHistory: {
        orderBy: {
          attemptedAt: "desc",
        },
      },
    },
    orderBy: {
      nextReminderDate: "asc",
    },
  });

  return problems.map((problem) => {
    const problemWithDates = {
      ...problem,
      nextReminderDate: problem.nextReminderDate.toISOString(),
      createdAt: problem.createdAt.toISOString(),
      lastAttemptedAt: problem.lastAttemptedAt?.toISOString() ?? null,
      canonicalPattern: {
        ...problem.canonicalPattern,
        createdAt: problem.canonicalPattern.createdAt.toISOString(),
      },
      customPattern: problem.customPattern
        ? {
            ...problem.customPattern,
            createdAt: problem.customPattern.createdAt.toISOString(),
          }
        : null,
      attemptHistory: problem.attemptHistory.map((attempt) => ({
        ...attempt,
        attemptedAt: attempt.attemptedAt.toISOString(),
      })),
    };
    return enrichProblemWithFailureNote(problemWithDates);
  });
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
      attemptHistory: {
        orderBy: {
          attemptedAt: "desc",
        },
      },
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

  return problems.map((problem) => {
    const problemWithDates = {
      ...problem,
      nextReminderDate: problem.nextReminderDate.toISOString(),
      createdAt: problem.createdAt.toISOString(),
      lastAttemptedAt: problem.lastAttemptedAt?.toISOString() ?? null,
      canonicalPattern: {
        ...problem.canonicalPattern,
        createdAt: problem.canonicalPattern.createdAt.toISOString(),
      },
      customPattern: problem.customPattern
        ? {
            ...problem.customPattern,
            createdAt: problem.customPattern.createdAt.toISOString(),
          }
        : null,
      attemptHistory: problem.attemptHistory.map((attempt) => ({
        ...attempt,
        attemptedAt: attempt.attemptedAt.toISOString(),
      })),
    };
    return enrichProblemWithFailureNote(problemWithDates);
  });
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
        attemptHistory: {
          orderBy: {
            attemptedAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return problems.map((problem) => {
      const problemWithDates = {
        ...problem,
        nextReminderDate: problem.nextReminderDate.toISOString(),
        createdAt: problem.createdAt.toISOString(),
        lastAttemptedAt: problem.lastAttemptedAt?.toISOString() ?? null,
        canonicalPattern: {
          ...problem.canonicalPattern,
          createdAt: problem.canonicalPattern.createdAt.toISOString(),
        },
        customPattern: problem.customPattern
          ? {
              ...problem.customPattern,
              createdAt: problem.customPattern.createdAt.toISOString(),
            }
          : null,
        attemptHistory: problem.attemptHistory.map((attempt) => ({
          ...attempt,
          attemptedAt: attempt.attemptedAt.toISOString(),
        })),
      };
      return enrichProblemWithFailureNote(problemWithDates);
    });
  }
);
