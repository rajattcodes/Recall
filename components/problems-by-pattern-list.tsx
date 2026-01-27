"use client";

import { Problem } from "@/lib/types/api";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupedProblems {
  patternName: string;
  problems: Problem[];
}

interface ProblemsByPatternListProps {
  groups: GroupedProblems[];
  className?: string;
}

export function ProblemsByPatternList({
  groups,
  className,
}: ProblemsByPatternListProps) {
  return (
    <div
      className={cn(
        "space-y-4 max-h-[60vh] overflow-y-auto pr-2",
        className
      )}
    >
      {groups.map(({ patternName, problems }) => (
        <div key={patternName} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {patternName}
          </h3>
          <ul className="space-y-1.5">
            {problems.map((p) => (
              <li key={p.id}>
                <a
                  href={p.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 text-sm text-primary hover:underline",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  )}
                >
                  <span className="truncate">{p.title}</span>
                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function groupProblemsByPattern(
  problems: Problem[]
): GroupedProblems[] {
  const map = new Map<string, Problem[]>();
  for (const p of problems) {
    const name =
      p.customPattern?.name ?? p.canonicalPattern?.name ?? "Unknown";
    if (!map.has(name)) map.set(name, []);
    map.get(name)!.push(p);
  }
  return Array.from(map.entries()).map(([patternName, problems]) => ({
    patternName,
    problems,
  }));
}
