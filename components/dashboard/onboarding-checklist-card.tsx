import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OnboardingChecklistItem } from "@/types";

export function OnboardingChecklistCard({
  items,
  completionScore,
}: {
  items: OnboardingChecklistItem[];
  completionScore: number;
}) {
  const allComplete = completionScore >= 100 || items.every((item) => item.completed);

  if (allComplete) {
    return (
      <Card className="glass-card border-default">
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_15%,var(--surface-card))]">
            <Check className="h-5 w-5 text-[var(--brand-blue)]" />
          </div>
          <div>
            <p className="font-semibold text-heading">You&apos;re all set!</p>
            <p className="text-subtle text-sm">
              Your profile is complete. Keep exploring jobs and communities.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-default">
      <CardHeader>
        <CardTitle className="text-base">Getting started</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-default px-3 py-2.5 transition-colors hover:bg-surface-muted"
          >
            {item.completed ? (
              <Check className="h-5 w-5 shrink-0 text-[var(--brand-blue)]" aria-hidden />
            ) : (
              <Circle className="text-subtle h-5 w-5 shrink-0" aria-hidden />
            )}
            <span
              className={
                item.completed
                  ? "text-subtle text-sm line-through"
                  : "text-sm font-medium text-heading"
              }
            >
              {item.label}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
