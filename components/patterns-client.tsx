"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PatternOverview } from "@/lib/types/api";
import { Problem } from "@/lib/types/api";
import { StatsCard, StatsGrid } from "@/components/stats-card";
import { StatsModal, type StatsModalType } from "@/components/stats-modal";
import { PatternCard } from "@/components/pattern-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  Layers,
  TrendingUp,
} from "lucide-react";

interface PatternsClientProps {
  patterns: PatternOverview[];
}

export function PatternsClient({ patterns }: PatternsClientProps) {
  const [modalType, setModalType] = useState<StatsModalType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState<{
    all?: Problem[];
    due?: Problem[];
    failed?: Problem[];
  }>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const openModal = useCallback(async (type: StatsModalType) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setModalType(type);
    if (type === "active") return;
    setModalLoading(true);
    const updates: {
      all?: Problem[];
      due?: Problem[];
      failed?: Problem[];
    } = {};
    
    try {
      if (type === "total") {
        const res = await fetch("/api/problems", { signal });
        if (res.ok && !signal.aborted) {
          updates.all = (await res.json()) as Problem[];
        }
      }
      if (type === "due") {
        const res = await fetch("/api/problems/due", { signal });
        if (res.ok && !signal.aborted) {
          updates.due = (await res.json()) as Problem[];
        }
      }
      if (type === "failed") {
        const res = await fetch("/api/problems/failed", { signal });
        if (res.ok && !signal.aborted) {
          updates.failed = (await res.json()) as Problem[];
        }
      }
      
      if (!signal.aborted) {
        setModalData((prev) => ({ ...prev, ...updates }));
        setModalLoading(false);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (!signal.aborted) {
        setModalLoading(false);
      }
    }
  }, []);

  const patternsWithProblems = patterns.filter((p) => p.total_problems > 0);
  const emptyPatterns = patterns.filter((p) => p.total_problems === 0);

  const totalProblems = patterns.reduce((sum, p) => sum + p.total_problems, 0);
  const totalDue = patterns.reduce((sum, p) => sum + p.due_count, 0);
  const totalFailed = patterns.reduce((sum, p) => sum + p.failed_count, 0);

  return (
    <>
      <StatsGrid>
        <StatsCard
          icon={BookOpen}
          value={totalProblems}
          label="Total Problems"
          onClick={() => openModal("total")}
        />
        <StatsCard
          icon={CalendarClock}
          value={totalDue}
          label="Due Today"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-500/10"
          onClick={() => openModal("due")}
        />
        <StatsCard
          icon={AlertCircle}
          value={totalFailed}
          label="Need Attention"
          iconColor="text-destructive"
          iconBgColor="bg-destructive/10"
          onClick={() => openModal("failed")}
        />
        <StatsCard
          icon={TrendingUp}
          value={patternsWithProblems.length}
          label="Active Patterns"
          iconColor="text-green-600"
          iconBgColor="bg-green-500/10"
          onClick={() => openModal("active")}
        />
      </StatsGrid>
      <StatsModal
        type={modalType}
        onClose={() => setModalType(null)}
        loading={modalLoading}
        problems={modalData}
        patterns={patterns}
      />

      {patternsWithProblems.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patternsWithProblems.map((pattern) => (
              <Link
                key={pattern.canonical_pattern.id}
                href={`/patterns/${pattern.canonical_pattern.id}`}
                className="block"
              >
                <PatternCard pattern={pattern} asLink />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={Layers}
          title="No patterns tracked yet"
          description="Add your first LeetCode problem to start tracking patterns and building mastery."
          action={{
            label: "Add a Problem",
            href: "/add",
          }}
        />
      )}

      {emptyPatterns.length > 0 && patternsWithProblems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-muted-foreground">
            Explore More Patterns
          </h2>
          <div className="flex flex-wrap gap-2">
            {emptyPatterns.map((pattern) => (
              <Badge
                key={pattern.canonical_pattern.id}
                variant="outline"
                className="px-3 py-1 text-sm"
                asChild
              >
                <Link href={`/patterns/${pattern.canonical_pattern.id}`}>
                  {pattern.canonical_pattern.name}
                </Link>
              </Badge>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
