"use client";

import { StatusBadge } from "@/components/ui/shared";
import { formatDate, formatLabel } from "@/lib/utils";
import type { ApplicationStatusLog } from "@/types";

interface StatusHistoryTimelineProps {
  history: ApplicationStatusLog[];
}

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
  if (!history.length) {
    return <p className="text-subtle text-sm">No status changes recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-0 border-l-2 border-default pl-6">
      {history.map((entry, index) => (
        <li key={entry.id} className="relative pb-8 last:pb-0">
          <span className="absolute -left-[1.625rem] top-1 flex h-3 w-3 rounded-full border-2 border-[var(--brand-blue)] bg-surface-card" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {entry.old_status ? (
                <>
                  <StatusBadge status={entry.old_status} />
                  <span className="text-subtle text-xs">→</span>
                </>
              ) : null}
              <StatusBadge status={entry.new_status} />
            </div>
            <p className="text-sm text-heading">
              {entry.old_status
                ? `Changed from ${formatLabel(entry.old_status)} to ${formatLabel(entry.new_status)}`
                : `Application submitted as ${formatLabel(entry.new_status)}`}
            </p>
            <p className="text-subtle text-xs">
              {formatDate(entry.created_at)}
              {entry.changed_by_name ? ` · by ${entry.changed_by_name}` : ""}
            </p>
          </div>
          {index < history.length - 1 ? null : null}
        </li>
      ))}
    </ol>
  );
}

export default StatusHistoryTimeline;
