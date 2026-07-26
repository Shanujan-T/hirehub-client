import { cn } from "@/lib/utils";

/** Outward-facing signal for employers — green pill matching existing badge sizing. */
export function OpenToWorkBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400",
        className,
      )}
    >
      Open to work
    </span>
  );
}

export const OPEN_TO_WORK_RING = "ring-2 ring-green-500 ring-offset-2 ring-offset-surface";
