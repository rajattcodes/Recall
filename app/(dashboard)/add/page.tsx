import { Suspense } from "react";
import { getPatterns } from "@/lib/patterns";
import { AddProblemClient } from "@/components/add-problem-client";
import { PageHeader } from "@/components/page-header";
import { LoadingSpinner } from "@/components/loading-spinner";

async function AddProblemContent() {
  const { canonicalPatterns, customPatterns } = await getPatterns();

  return (
    <AddProblemClient
      initialCanonicalPatterns={canonicalPatterns}
      initialCustomPatterns={customPatterns}
    />
  );
}

export default function AddProblemPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader
        title="Add New Problem"
        description="Track a LeetCode problem for spaced repetition practice."
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <AddProblemContent />
      </Suspense>
    </div>
  );
}
