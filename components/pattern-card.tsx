"use client";

import { memo } from "react";
import { PatternOverview } from "@/lib/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, CalendarClock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatternCardProps {
  pattern: PatternOverview;
  onClick?: () => void;
  asLink?: boolean;
  className?: string;
}

/**
 * Reusable pattern card component for displaying pattern overview
 */
export const PatternCard = memo(function PatternCard({
  pattern,
  onClick,
  asLink,
  className,
}: PatternCardProps) {
  const { canonical_pattern, total_problems, due_count, failed_count } = pattern;
  const hasIssues = due_count > 0 || failed_count > 0;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        hasIssues && "border-l-4 border-l-amber-500",
        (onClick || asLink) && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full",
                hasIssues ? "bg-amber-500/10" : "bg-primary/10"
              )}
            >
              <Layers
                className={cn(
                  "size-5",
                  hasIssues ? "text-amber-600" : "text-primary"
                )}
              />
            </div>
            <div>
              <CardTitle className="text-base">{canonical_pattern.name}</CardTitle>
              <CardDescription>
                {total_problems} {total_problems === 1 ? "problem" : "problems"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          {due_count > 0 && (
            <Badge
              variant="secondary"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
            >
              <CalendarClock className="size-3 mr-1" />
              {due_count} due
            </Badge>
          )}
          {failed_count > 0 && (
            <Badge
              variant="secondary"
              className="bg-destructive/10 text-destructive border-destructive/20"
            >
              <AlertCircle className="size-3 mr-1" />
              {failed_count} failed
            </Badge>
          )}
          {!hasIssues && (
            <span className="text-sm text-muted-foreground">All caught up!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Skeleton loading state for PatternCard
 */
export function PatternCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

/**
 * Grid of pattern card skeletons
 */
export function PatternCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PatternCardSkeleton key={i} />
      ))}
    </div>
  );
}
