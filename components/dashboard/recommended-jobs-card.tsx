import Link from "next/link";
import { Briefcase, Sparkles } from "lucide-react";
import { JobCard } from "@/components/cards/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/app/_components/page-states";
import type { Job } from "@/types";

export function RecommendedJobsCard({ jobs }: { jobs: Job[] }) {
  return (
    <Card className="glass-card overflow-hidden border-default">
      <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-magenta)_8%,var(--surface-card))]">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#e040fb]" />
          Recommended for you
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {jobs.length ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No recommendations yet"
            description="Add more skills to improve your job matches."
            action={
              <Link href="/my/skills/new" className="text-sm font-semibold text-[var(--brand-blue)]">
                Add skills →
              </Link>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
