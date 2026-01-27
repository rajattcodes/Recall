import { Suspense } from "react";
import { getPatterns } from "@/lib/patterns";
import { AddProblemClient } from "@/components/add-problem-client";
import { PageHeader } from "@/components/page-header";
import { LoadingSpinner } from "@/components/loading-spinner";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function AddProblemContent({
  patternId,
}: {
  patternId: string | null;
}) {
  const { canonicalPatterns, customPatterns } = await getPatterns();

  return (
    <AddProblemClient
      initialCanonicalPatterns={canonicalPatterns}
      initialCustomPatterns={customPatterns}
      initialPatternId={patternId}
    />
  );
}

export default async function AddProblemPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const patternParam = params?.pattern;
  const patternId =
    typeof patternParam === "string" ? patternParam : null;

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
        <AddProblemContent patternId={patternId} />
      </Suspense>
    </div>
  );
}
