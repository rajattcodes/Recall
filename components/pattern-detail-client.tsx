"use client";

import { Problem } from "@/lib/types/api";
import { CanonicalPattern } from "@/lib/types/api";
import { EmptyState } from "@/components/empty-state";
import { PatternBadge } from "@/components/pattern-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ExternalLink, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const stageLabels: Record<string, { label: string; color: string }> = {
  day_3: {
    label: "Day 3",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  day_10: {
    label: "Day 10",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  },
  day_30: {
    label: "Day 30",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  completed: {
    label: "Mastered",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
};

interface PatternDetailClientProps {
  canonicalPattern: CanonicalPattern;
  problems: Problem[];
}

export function PatternDetailClient({
  canonicalPattern,
  problems,
}: PatternDetailClientProps) {
  if (problems.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No problems yet for this pattern"
        description="Add your first LeetCode problem to start tracking and revising with spaced repetition."
        action={{
          label: "Add problem",
          href: `/add?pattern=${canonicalPattern.id}`,
        }}
      />
    );
  }

  const grouped = groupByCustomPattern(problems);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">
        {problems.length}{" "}
        {problems.length === 1 ? "problem" : "problems"}
      </h2>
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([groupKey, items]) => (
          <div key={groupKey} className="space-y-3">
            {groupKey !== "default" && (
              <h3 className="text-sm font-medium text-muted-foreground">
                {groupKey}
              </h3>
            )}
            <ul className="space-y-2">
              {items.map((problem) => (
                <ProblemRow key={problem.id} problem={problem} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function groupByCustomPattern(problems: Problem[]): Map<string, Problem[]> {
  const map = new Map<string, Problem[]>();
  for (const p of problems) {
    const key = p.customPattern?.name ?? "default";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return map;
}

function ProblemRow({ problem }: { problem: Problem }) {
  const stage =
    stageLabels[problem.reminderStage] ?? stageLabels.day_3;

  return (
    <Card className="py-3 transition-all hover:shadow-md">
      <CardHeader className="py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "font-medium truncate inline-flex items-center gap-1.5",
                  "hover:text-primary transition-colors group"
                )}
              >
                <span className="truncate">{problem.title}</span>
                <ExternalLink className="size-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PatternBadge
                canonicalPattern={problem.canonicalPattern}
                customPattern={problem.customPattern}
                size="sm"
              />
              <Badge
                variant="secondary"
                className={cn("text-xs", stage.color)}
              >
                {stage.label}
              </Badge>
              {problem.failureCount > 0 && (
                <span className="text-xs text-destructive">
                  {problem.failureCount} failed
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground">
              {problem.totalAttempts} attempts
            </span>
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Open
            </a>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
