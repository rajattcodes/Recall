import { ProblemSkeletonList } from "@/components/problem-skeleton";
import { SectionHeader } from "@/components/section-header";
import { Layers } from "lucide-react";

export default function PatternDetailLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="h-24 bg-muted rounded-lg animate-pulse" />
      <section className="space-y-4">
        <SectionHeader
          icon={Layers}
          title="Problems"
          description="Loading..."
        />
        <ProblemSkeletonList count={4} />
      </section>
    </div>
  );
}
