import { Suspense } from "react";
import { getPatternsOverview } from "@/lib/patterns";
import { PatternsClient } from "@/components/patterns-client";
import { PageHeader } from "@/components/page-header";
import { PatternCardSkeletonGrid } from "@/components/pattern-card";
import { StatsGrid } from "@/components/stats-card";

async function PatternsContent() {
  const patterns = await getPatternsOverview();

  return <PatternsClient patterns={patterns} />;
}

export default function PatternsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Pattern Overview"
        description="Track your progress across different algorithm patterns."
      />

      <Suspense
        fallback={
          <>
            <StatsGrid>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </StatsGrid>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Your Patterns</h2>
              <PatternCardSkeletonGrid count={6} />
            </section>
          </>
        }
      >
        <PatternsContent />
      </Suspense>
    </div>
  );
}
