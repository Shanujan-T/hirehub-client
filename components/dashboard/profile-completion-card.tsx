import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { OnboardingChecklistItem } from "@/types";

export function ProfileCompletionCard({
  completionScore,
  incompleteItems,
  badges,
}: {
  completionScore: number;
  incompleteItems: OnboardingChecklistItem[];
  badges?: string[];
}) {
  return (
    <Card className="glass-card border-default">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-heading">Profile completion</p>
          <span className="text-sm font-bold text-[var(--brand-blue)]">{completionScore}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 transition-all"
            style={{ width: `${completionScore}%` }}
          />
        </div>
        {incompleteItems.length > 0 ? (
          <ul className="space-y-1.5 pt-1">
            {incompleteItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-subtle hover:text-heading text-xs transition-colors"
                >
                  ○ {item.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {badges?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_12%,var(--surface-muted))] px-2.5 py-0.5 text-xs font-semibold text-heading"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
