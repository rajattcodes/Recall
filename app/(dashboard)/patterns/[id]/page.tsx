import { notFound } from "next/navigation";
import { getCanonicalPatternById } from "@/lib/patterns";
import { getProblemsForPattern } from "@/lib/problems";
import { PatternDetailClient } from "@/components/pattern-detail-client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatternDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [canonicalPattern, problems] = await Promise.all([
    getCanonicalPatternById(id),
    getProblemsForPattern(id),
  ]);

  if (!canonicalPattern) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title={canonicalPattern.name}
        description={canonicalPattern.description ?? undefined}
      >
        <Button asChild>
          <Link href={`/add?pattern=${id}`}>
            <Plus className="size-4 mr-2" />
            Add problem
          </Link>
        </Button>
      </PageHeader>
      <PatternDetailClient
        canonicalPattern={canonicalPattern}
        problems={problems}
      />
    </div>
  );
}
