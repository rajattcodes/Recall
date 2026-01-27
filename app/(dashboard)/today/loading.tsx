import { PageHeader } from "@/components/page-header";
import { ProblemSkeletonList } from "@/components/problem-skeleton";
import { SectionHeader } from "@/components/section-header";
import { CalendarCheck } from "lucide-react";

export default function TodayLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Today's Practice"
        description="Review due problems and tackle failed ones to reinforce your learning."
      />
      <section className="space-y-4">
        <SectionHeader
          icon={CalendarCheck}
          title="Due Today"
          description="Loading..."
        />
        <ProblemSkeletonList count={3} />
      </section>
    </div>
  );
}
