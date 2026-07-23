import Link from "next/link";
import { Activity, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";

export function RecentActivityCard({ activity }: { activity: ActivityItem[] }) {
  return (
    <Card className="glass-card overflow-hidden border-default">
      <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))]">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {activity.length ? (
          activity.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-default p-3"
            >
              <FileText className="text-subtle mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                {item.application_id ? (
                  <Link
                    href={`/applications/${item.application_id}`}
                    className="text-sm font-medium text-heading hover:text-[var(--brand-blue)]"
                  >
                    {item.description}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-heading">{item.description}</p>
                )}
                <p className="text-subtle mt-0.5 text-xs">
                  {formatRelativeTime(item.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-subtle text-sm">
            Activity from your applications will show up here once you apply to jobs.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
