"use client";

import { memo } from "react";
import { Problem } from "@/lib/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PatternBadge } from "@/components/pattern-badge";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemCardProps {
  problem: Problem;
  onMarkSolved: () => void;
  onMarkFailed: () => void;
  isLoading?: boolean;
  showFailureCount?: boolean;
}

const stageLabels: Record<string, { label: string; color: string }> = {
  day_3: { label: "Day 3", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  day_10: { label: "Day 10", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  day_30: { label: "Day 30", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  completed: { label: "Mastered", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
};

const statusColors: Record<string, string> = {
  fresh: "border-l-blue-500",
  active: "border-l-purple-500",
  failed: "border-l-destructive",
  mastered: "border-l-green-500",
};

export const ProblemCard = memo(function ProblemCard({
  problem,
  onMarkSolved,
  onMarkFailed,
  isLoading = false,
  showFailureCount = false,
}: ProblemCardProps) {
  const stage = stageLabels[problem.reminderStage] || stageLabels.day_3;
  const statusColor = statusColors[problem.status] || statusColors.fresh;

  return (
    <Card
      className={cn(
        "border-l-4 transition-all hover:shadow-md",
        statusColor
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-lg leading-tight">
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-primary transition-colors group"
              >
                <span className="truncate">{problem.title}</span>
                <ExternalLink className="size-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <PatternBadge
                canonicalPattern={problem.canonicalPattern}
                customPattern={problem.customPattern}
              />
            </CardDescription>
          </div>

          {/* Stage Badge */}
          <Badge variant="secondary" className={cn("shrink-0", stage.color)}>
            <Clock className="size-3 mr-1" />
            {stage.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {problem.failureNotes && problem.failureNotes.length > 0 && (
          <div className="mb-4 p-3 rounded-md bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-destructive">Previous failure:</p>
                <ul className="text-sm text-muted-foreground space-y-0.5">
                  {problem.failureNotes.map((note, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-destructive/60 shrink-0">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="size-4" />
              {problem.totalAttempts} attempts
            </span>
            {showFailureCount && problem.failureCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="size-4" />
                {problem.failureCount} failures
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkFailed}
              disabled={isLoading}
              className="flex-1 sm:flex-initial text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Mark problem as failed"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <XCircle className="size-4 mr-1.5" aria-hidden="true" />
              )}
              Failed
            </Button>
            <Button
              size="sm"
              onClick={onMarkSolved}
              disabled={isLoading}
              className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white"
              aria-label="Mark problem as solved"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle className="size-4 mr-1.5" aria-hidden="true" />
              )}
              Solved
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
