"use client";

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

export function deadlineUrgencyClass(
  daysRemaining: number | null | undefined,
): string {
  if (daysRemaining == null) return "";
  if (daysRemaining < 0) {
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }
  if (daysRemaining <= 1) {
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }
  if (daysRemaining <= 3) {
    return "bg-amber-500/15 text-amber-800 dark:text-amber-300";
  }
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        deadlineUrgencyClass(daysRemaining),
        className,
      )}
    >
      {label}
    </span>
  );
}

export default DeadlineCountdown;
