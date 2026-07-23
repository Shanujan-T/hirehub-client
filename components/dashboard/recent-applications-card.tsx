import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/shared";
import { EmptyState } from "@/app/_components/page-states";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/types";

export function RecentApplicationsCard({ applications }: { applications: Application[] }) {
  return (
    <Card className="glass-card overflow-hidden border-default">
      <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))]">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent applications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {applications.length ? (
          applications.map((app) => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="flex items-center justify-between rounded-xl border border-default p-4 transition-colors hover:bg-surface-muted"
            >
              <div>
                <p className="font-semibold text-heading">{app.job?.title ?? "Job"}</p>
                <p className="text-subtle text-sm">{formatDate(app.created_at)}</p>
              </div>
              <StatusBadge status={app.status} />
            </Link>
          ))
        ) : (
          <EmptyState
            icon={FileText}
            title="Browse jobs and apply to get started"
            description="Your application history will appear here once you apply."
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
