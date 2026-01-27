import { Suspense } from "react";
import { getDueAndFailedProblems } from "@/lib/problems";
import { TodayProblemsClient } from "@/components/today-problems-client";
import { PageHeader } from "@/components/page-header";
import { ProblemSkeletonList } from "@/components/problem-skeleton";
import { SectionHeader } from "@/components/section-header";
import { CalendarCheck } from "lucide-react";

async function TodayProblemsContent() {
  const { dueProblems, failedProblems } = await getDueAndFailedProblems();

  return (
    <TodayProblemsClient
      initialDueProblems={dueProblems}
      initialFailedProblems={failedProblems}
    />
  );
}

export default function TodayPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Today's Practice"
        description="Review due problems and tackle failed ones to reinforce your learning."
      />

      <Suspense
        fallback={
          <section className="space-y-4">
            <SectionHeader
              icon={CalendarCheck}
              title="Due Today"
              description="Loading..."
            />
            <ProblemSkeletonList count={3} />
          </section>
        }
      >
        <TodayProblemsContent />
      </Suspense>
    </div>
  );
}
