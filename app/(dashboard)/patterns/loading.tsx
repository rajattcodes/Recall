import { PageHeader } from "@/components/page-header";
import { PatternCardSkeletonGrid } from "@/components/pattern-card";
import { StatsGrid } from "@/components/stats-card";

export default function PatternsLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Pattern Overview"
        description="Track your progress across different algorithm patterns."
      />
      <StatsGrid>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </StatsGrid>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Patterns</h2>
        <PatternCardSkeletonGrid count={6} />
      </section>
    </div>
  );
}
