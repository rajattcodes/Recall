"use client";

import { useState } from "react";
import { Problem } from "@/lib/types/api";
import { ProblemCard } from "@/components/problem-card";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { toast } from "sonner";
import { AlertTriangle, CalendarCheck, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";

interface TodayProblemsClientProps {
  initialDueProblems: Problem[];
  initialFailedProblems: Problem[];
}

export function TodayProblemsClient({
  initialDueProblems,
  initialFailedProblems,
}: TodayProblemsClientProps) {
  const router = useRouter();
  const [dueProblems, setDueProblems] = useState<Problem[]>(initialDueProblems);
  const [failedProblems, setFailedProblems] =
    useState<Problem[]>(initialFailedProblems);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleMarkProblem = async (
    problemId: string,
    result: "solved" | "failed"
  ) => {
    setActionLoading(problemId);
    try {
      const response = await fetch(`/api/problems/${problemId}/mark`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark problem");
      }

      const updatedProblem: Problem = await response.json();

      if (result === "solved") {
        setDueProblems((prev) => prev.filter((p) => p.id !== problemId));
        setFailedProblems((prev) => prev.filter((p) => p.id !== problemId));
        toast.success("Nice work! Problem marked as solved");
      } else {
        setDueProblems((prev) => prev.filter((p) => p.id !== problemId));
        setFailedProblems((prev) => {
          const exists = prev.find((p) => p.id === problemId);
          if (exists) {
            return prev.map((p) => (p.id === problemId ? updatedProblem : p));
          }
          return [updatedProblem, ...prev];
        });
        toast.info("Problem marked as failed. Keep practicing!");
      }

      router.refresh();
    } catch (error) {
      console.error("Error marking problem:", error);
      toast.error("Failed to update problem");
    } finally {
      setActionLoading(null);
    }
  };

  const allCaughtUp = dueProblems.length === 0 && failedProblems.length === 0;

  if (allCaughtUp) {
    return (
      <EmptyState
        icon={PartyPopper}
        title="All caught up!"
        description="You don't have any problems due today. Great job staying on top of your practice!"
        action={{
          label: "Add a Problem",
          href: "/add",
        }}
      />
    );
  }

  return (
    <>
      <section className="space-y-4">
        <SectionHeader
          icon={CalendarCheck}
          title="Due Today"
          description={`${dueProblems.length} ${
            dueProblems.length === 1 ? "problem" : "problems"
          } to review`}
        />

        {dueProblems.length > 0 ? (
          <div className="grid gap-4">
            {dueProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onMarkSolved={() => handleMarkProblem(problem.id, "solved")}
                onMarkFailed={() => handleMarkProblem(problem.id, "failed")}
                isLoading={actionLoading === problem.id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground">
              No problems due today. Check back tomorrow!
            </p>
          </div>
        )}
      </section>

      {failedProblems.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            icon={AlertTriangle}
            iconColor="text-destructive"
            iconBgColor="bg-destructive/10"
            title="Needs Attention"
            description={`${failedProblems.length} ${
              failedProblems.length === 1 ? "problem" : "problems"
            } marked as failed`}
          />

          <div className="grid gap-4">
            {failedProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onMarkSolved={() => handleMarkProblem(problem.id, "solved")}
                onMarkFailed={() => handleMarkProblem(problem.id, "failed")}
                isLoading={actionLoading === problem.id}
                showFailureCount
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
