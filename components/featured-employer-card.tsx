"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Briefcase } from "lucide-react";
import { EntityAvatar } from "@/components/entity-avatar";
import { Button } from "@/components/ui/button";
import companiesService from "@/services/companies";
import type { Company } from "@/types";

const ROTATE_MS = 18_000;

export function FeaturedEmployerCard() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    companiesService
      .listFeatured(5)
      .then((rows) => {
        if (!cancelled) setCompanies(rows);
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (companies.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % companies.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [companies.length]);

  if (!loaded || companies.length === 0) return null;

  const company = companies[index % companies.length];
  const pitch =
    company.featured_pitch_display ||
    company.featured_pitch ||
    `${company.name} is hiring — ${company.open_jobs_count ?? 0} open roles`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-default bg-surface-card p-4">
      {/* Brand accent bar — same language as job/community list cards */}
      <div
        className="brand-gradient absolute inset-y-0 left-0 w-[3px]"
        aria-hidden
      />

      <h3 className="text-heading flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
        <Briefcase
          className="h-4 w-4 shrink-0 text-[var(--brand-blue)]"
          aria-hidden
        />
        Hiring Now
      </h3>

      <div className="mt-3 flex items-start gap-3">
        <EntityAvatar
          name={company.name}
          imageUrl={company.logo_url}
          entityId={company.id}
          industry={company.industry}
          variant="company"
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="text-heading flex items-center gap-1 truncate font-semibold">
            <span className="truncate">{company.name}</span>
            {company.is_verified ? (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-[var(--brand-blue)]"
                aria-label="Verified company"
              />
            ) : null}
          </p>
          {company.industry ? (
            <p className="text-subtle mt-0.5 truncate text-xs">{company.industry}</p>
          ) : null}
        </div>
      </div>

      <p className="text-subtle mt-3 text-sm leading-relaxed">{pitch}</p>

      <Button
        type="button"
        className="mt-4 w-full"
        size="sm"
        onClick={() => router.push(`/companies/${company.id}`)}
      >
        View Company
      </Button>
    </div>
  );
}
