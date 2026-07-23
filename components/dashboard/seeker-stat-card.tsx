import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SeekerStatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  icon: typeof Briefcase;
  href?: string;
}) {
  const content = (
    <Card className="border-default bg-surface-card card-hover h-full">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)]">
          <Icon className="h-6 w-6 text-[var(--brand-blue)]" />
        </div>
        <div>
          <p className="text-subtle text-sm">{label}</p>
          <p className="font-display text-2xl font-bold text-heading">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
