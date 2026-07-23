import Link from "next/link";
import { Briefcase } from "lucide-react";
import { JobCard } from "@/components/cards/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/app/_components/page-states";
import type { Job } from "@/types";

export function RecentlyPostedJobsCard({ jobs }: { jobs: Job[] }) {
  return (
    <Card className="glass-card overflow-hidden border-default">
      <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-orange)_8%,var(--surface-card))]">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Recently posted
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 lg:grid-cols-2">
        {jobs.length ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No open jobs yet"
            description="Check back soon for new opportunities."
            action={
              <Link href="/jobs" className="text-sm font-semibold text-[var(--brand-blue)]">
                Browse jobs →
              </Link>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
