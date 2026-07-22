"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Briefcase, Building2, Check, Clock, LogOut, MapPin } from "lucide-react";
import { EntityAvatar } from "@/components/entity-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatLabel, formatSalary, resolveMediaUrl } from "@/lib/utils";
import type { Community, Company, Job } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    closed: "bg-blue-900/15 text-blue-600 dark:text-blue-200",
    filled: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-surface-muted text-subtle",
      )}
    >
      {formatLabel(status)}
    </span>
  );
}

function SkillTags({ skills, limit = 4 }: { skills?: Job["skills"]; limit?: number }) {
  if (!skills?.length) return null;

  const names = skills
    .map((js) => js.skill?.name)
    .filter((name): name is string => Boolean(name));

  if (!names.length) return null;

  const visible = names.slice(0, limit);
  const remaining = names.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((name) => (
        <span
          key={name}
          className="rounded-md bg-[color-mix(in_srgb,var(--brand-blue)_10%,var(--surface-muted))] px-2 py-0.5 text-xs font-medium text-heading"
        >
          {name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="rounded-md px-2 py-0.5 text-xs font-medium text-subtle">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  className?: string;
  showStatus?: boolean;
  variant?: "default" | "compact";
  hideCompanyVerified?: boolean;
}

function SalaryDisplay({
  min,
  max,
}: {
  min: number | null | undefined;
  max: number | null | undefined;
}) {
  const label = formatSalary(min, max);
  if (label === "Not disclosed") {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Not disclosed
      </span>
    );
  }
  return <p className="text-sm font-medium text-heading">{label}</p>;
}

export function JobCard({
  job,
  className,
  showStatus = true,
  variant = "default",
  hideCompanyVerified = false,
}: JobCardProps) {
  const company = job.company;

  if (variant === "compact") {
    return (
      <Link
        href={`/jobs/${job.id}`}
        className={cn(
          "group block rounded-xl border border-default bg-surface-card p-4 shadow-sm transition-shadow hover:shadow-md",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <JobThumbnail job={job} />
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-heading group-hover:text-[var(--brand-blue)]">
                {job.title}
              </h3>
              <p className="mt-0.5 text-sm text-subtle">
                {company?.name ?? "Company"}
                {!hideCompanyVerified && company?.is_verified && (
                  <BadgeCheck
                    className="ml-1 inline h-3.5 w-3.5 text-[var(--brand-blue)]"
                    aria-label="Verified company"
                  />
                )}
              </p>
            </div>
          </div>
          {showStatus && <StatusBadge status={job.status} />}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl glass-card p-5 card-hover",
        "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:scale-x-0 before:bg-gradient-to-r before:from-[#22d3ee] before:via-[#AB2F74] before:to-[#F94D32] before:transition-transform before:duration-300 group-hover:before:scale-x-100",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <JobThumbnail job={job} />
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-heading group-hover:text-[var(--brand-blue)]">
              {job.title}
            </h3>
            <p className="mt-0.5 text-sm text-subtle">
              {company?.name ?? "Company"}
              {!hideCompanyVerified && company?.is_verified && (
                <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-[var(--brand-blue)]" aria-label="Verified company" />
              )}
            </p>
          </div>
        </div>
        {showStatus && <StatusBadge status={job.status} />}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-subtle">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        {job.distance_km != null && (
          <span className="text-xs font-medium text-[var(--brand-blue)]">
            ~{job.distance_km} km from you
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {job.job_type === "micro_internship" ? (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              Micro-internship
            </span>
          ) : (
            formatLabel(job.job_type)
          )}{" "}
          · {formatLabel(job.experience_level)}
        </span>
      </div>

      <SalaryDisplay min={job.salary_min} max={job.salary_max} />

      <SkillTags skills={job.skills} />

      {job.matched_skills?.length ? (
        <p className="text-xs text-[var(--brand-blue)]">
          Matched: {job.matched_skills.join(", ")}
        </p>
      ) : null}
    </Link>
  );
}

function CompanyAvatar({ company }: { company?: Company }) {
  if (!company) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-default bg-surface-muted text-subtle">
        <Building2 className="h-5 w-5" />
      </div>
    );
  }

  return (
    <EntityAvatar
      name={company.name}
      imageUrl={company.logo_url}
      entityId={company.id}
      industry={company.industry}
      variant="company"
      size="sm"
      className="rounded-lg"
    />
  );
}

function JobThumbnail({ job, className }: { job: Job; className?: string }) {
  const imageSrc = resolveMediaUrl(job.image_url);
  if (imageSrc) {
    return (
      <div
        className={cn(
          "relative size-16 shrink-0 overflow-hidden rounded-lg border border-default",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return <CompanyAvatar company={job.company} />;
}

interface CompanyCardProps {
  company: Company;
  jobCount?: number;
  className?: string;
}

function StatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function CompanyCard({ company, jobCount, className }: CompanyCardProps) {
  const openJobs = jobCount ?? company.open_jobs_count ?? 0;

  return (
    <Link
      href={`/companies/${company.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl glass-card p-5 card-hover",
        "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:scale-x-0 before:bg-gradient-to-r before:from-[#22d3ee] before:via-[#AB2F74] before:to-[#F94D32] before:transition-transform before:duration-300 group-hover:before:scale-x-100",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <EntityAvatar
          name={company.name}
          imageUrl={company.logo_url}
          entityId={company.id}
          industry={company.industry}
          variant="company"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-base font-semibold text-heading group-hover:text-[var(--brand-blue)]">
              {company.name}
            </h3>
            {company.is_verified && (
              <StatusPill className="bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)] text-[var(--brand-blue)]">
                Verified
              </StatusPill>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-2">
        {company.description ? (
          <p className="line-clamp-1 text-sm text-subtle">{company.description}</p>
        ) : null}
        <p className="text-sm font-medium text-heading">
          {openJobs} open {openJobs === 1 ? "position" : "positions"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-default pt-4 text-sm text-subtle">
        {company.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0" />
            {company.location}
          </span>
        )}
        {company.industry && (
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-4 w-4 shrink-0" />
            {company.industry}
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-medium text-heading">
          <Building2 className="h-4 w-4 shrink-0" />
          {openJobs} open
        </span>
      </div>
    </Link>
  );
}

interface CommunityCardProps {
  community: Community;
  mode?: "browse" | "my-communities";
  onJoin?: (communityId: number) => void;
  onLeave?: (communityId: number) => void;
  joinLoading?: boolean;
  leaveLoading?: boolean;
  className?: string;
}

export function CommunityCard({
  community,
  mode = "browse",
  onJoin,
  onLeave,
  joinLoading = false,
  leaveLoading = false,
  className,
}: CommunityCardProps) {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const isMember = mode === "my-communities" ? true : (community.is_member ?? false);

  return (
    <Card className={cn("flex h-full flex-col card-hover", className)}>
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start gap-3">
          <EntityAvatar
            name={community.name}
            imageUrl={community.avatar_url}
            entityId={community.id}
            communityType={community.type}
            variant="community"
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/communities/${community.id}`}
              className="text-heading font-bold hover:text-[var(--brand-blue)]"
            >
              {community.name}
            </Link>
            <p className="text-subtle mt-0.5 text-xs">
              {formatLabel(community.type)} · {community.member_count ?? 0} members
            </p>
          </div>
        </div>

        {community.description && (
          <p className="text-subtle line-clamp-2 flex-1 text-sm">{community.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-default pt-4 text-sm text-subtle">
          {community.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              {community.location}
            </span>
          )}
          {community.industry && (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-4 w-4 shrink-0" />
              {community.industry}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4 shrink-0" />
            {community.member_count ?? 0} members
          </span>
        </div>

        <div className="mt-4 flex justify-end">
          {mode === "my-communities" ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/communities/${community.id}?from=my-communities`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View
              </Link>
              <div className="relative">
                {confirmLeave ? (
                  <div className="absolute bottom-full right-0 z-10 mb-2 w-56 rounded-xl border border-default bg-surface-card p-3 shadow-lg">
                    <p className="text-heading text-sm font-medium">Leave this community?</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmLeave(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        loading={leaveLoading}
                        onClick={() => {
                          setConfirmLeave(false);
                          onLeave?.(community.id);
                        }}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmLeave(true)}
                >
                  <LogOut className="h-4 w-4" />
                  Leave
                </Button>
              </div>
            </div>
          ) : isMember ? (
            <Link
              href={`/communities/${community.id}`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-subtle" })}
            >
              <Check className="h-4 w-4" />
              Joined
            </Link>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              loading={joinLoading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onJoin?.(community.id);
              }}
            >
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
