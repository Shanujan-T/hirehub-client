"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineCountdownProps {
  daysRemaining: number | null | undefined;
  deadline?: string | null;
  className?: string;
}

export function deadlineLabel(daysRemaining: number | null | undefined): string | null {
  if (daysRemaining == null) return null;
  if (daysRemaining < 0) return "Deadline passed";
  if (daysRemaining === 0) return "Closes today";
  if (daysRemaining === 1) return "1 day left to apply";
  return `${daysRemaining} days left to apply`;
}

/** Text-only urgency colors — no pill/bar background. */
export function deadlineUrgencyClass(
  daysRemaining: number | null | undefined,
): string {
  if (daysRemaining == null) return "";
  if (daysRemaining <= 1) {
    return "text-red-600 dark:text-red-400";
  }
  if (daysRemaining <= 3) {
    return "text-amber-600 dark:text-amber-400";
  }
  // >3 days (including >7): muted, same weight as location/job-type row
  return "text-subtle";
}

export function DeadlineCountdown({
  daysRemaining,
  className,
}: DeadlineCountdownProps) {
  const label = deadlineLabel(daysRemaining);
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 self-start text-sm",
        deadlineUrgencyClass(daysRemaining),
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default DeadlineCountdown;
