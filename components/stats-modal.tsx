"use client";

import { Problem } from "@/lib/types/api";
import { PatternOverview } from "@/lib/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ProblemsByPatternList,
  groupProblemsByPattern,
} from "@/components/problems-by-pattern-list";
import Link from "next/link";

export type StatsModalType = "total" | "due" | "failed" | "active";

interface StatsModalProps {
  type: StatsModalType | null;
  onClose: () => void;
  loading?: boolean;
  problems?: {
    all?: Problem[];
    due?: Problem[];
    failed?: Problem[];
  };
  patterns?: PatternOverview[];
}

const titles: Record<StatsModalType, string> = {
  total: "Total Problems",
  due: "Due Today",
  failed: "Need Attention",
  active: "Active Patterns",
};

export function StatsModal({
  type,
  onClose,
  loading = false,
  problems = {},
  patterns = [],
}: StatsModalProps) {
  if (!type) return null;

  const title = titles[type];

  if (type === "active") {
    const withProblems = patterns.filter((p) => p.total_problems > 0);
    return (
      <Dialog open={!!type} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
            {withProblems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No patterns with problems yet.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {withProblems.map((p) => (
                  <li key={p.canonical_pattern.id}>
                    <Link
                      href={`/patterns/${p.canonical_pattern.id}`}
                      className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {p.canonical_pattern.name}
                      <span className="text-muted-foreground ml-1">
                        ({p.total_problems})
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const list =
    type === "total"
      ? problems.all ?? []
      : type === "due"
        ? problems.due ?? []
        : problems.failed ?? [];

  const groups = groupProblemsByPattern(list);

  return (
    <Dialog open={!!type} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {type === "total"
              ? "No problems yet."
              : type === "due"
                ? "Nothing due today."
                : "No failed problems."}
          </p>
        ) : (
          <ProblemsByPatternList groups={groups} />
        )}
      </DialogContent>
    </Dialog>
  );
}
