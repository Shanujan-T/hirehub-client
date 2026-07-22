"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { JobCard } from "@/components/cards/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/shared";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import dashboardService from "@/services/dashboard";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { SeekerDashboard } from "@/types";

function SeekerDashboardContent() {
  const [data, setData] = useState<SeekerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSkills, setHasSkills] = useState(true);

  useEffect(() => {
    catalogService
      .listMySkills()
      .then((skills) => setHasSkills(skills.length > 0))
      .catch(() => setHasSkills(true));
  }, []);

  useEffect(() => {
    dashboardService
      .get()
      .then((dashboard) => {
        if (dashboard.role === "seeker") setData(dashboard);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (!data) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Dashboard unavailable"
        description="Could not load your dashboard data."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider brand-gradient-text">
          Welcome back
        </p>
        <h1 className="section-title mt-1 text-3xl">Dashboard</h1>
        <p className="text-subtle mt-1">Track applications and discover recommended jobs</p>
      </div>

      {!hasSkills ? (
        <EmptyState
          icon={Sparkles}
          title="Add your first skill to get job recommendations"
          description="Tell us what you're good at and we'll surface matching roles."
          action={
            <Link href="/my/skills/new" className="text-sm font-semibold text-[var(--brand-blue)]">
              Add a skill →
            </Link>
          }
        />
      ) : null}

      {typeof data.profile_completion_score === "number" ? (
        <Card className="glass-card border-default">
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-heading">Profile completion</p>
              <span className="text-sm font-bold text-[var(--brand-blue)]">
                {data.profile_completion_score}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-magenta)] transition-all"
                style={{ width: `${data.profile_completion_score}%` }}
              />
            </div>
            {data.badges?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.badges.map((badge) => (
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
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(data.applications_by_status ?? {}).map(([status, count]) => (
          <div key={status} className="stat-card p-5">
            <StatusBadge status={status} />
            <p className="mt-3 text-3xl font-extrabold text-heading">{count}</p>
            <p className="text-subtle mt-1 text-xs font-medium uppercase tracking-wide">
              {status.replace(/_/g, " ")}
            </p>
          </div>
        ))}
      </div>

      <Card className="glass-card overflow-hidden border-default">
        <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-magenta)_8%,var(--surface-card))]">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#e040fb]" />
            Recommended for you
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {data.recommended_jobs?.length ? (
            data.recommended_jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No recommendations yet"
              description="Add more skills to improve your job matches."
              action={
                <Link href="/my/skills/new" className="text-sm font-semibold text-[var(--brand-blue)]">
                  Add skills →
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden border-default">
        <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))]">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent applications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.applications?.length ? (
            data.applications.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between rounded-xl border border-default p-4 transition-colors hover:bg-surface-muted"
              >
                <div>
                  <p className="font-semibold text-heading">{app.job?.title ?? "Job"}</p>
                  <p className="text-subtle text-sm">{formatDate(app.created_at)}</p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="Browse jobs and apply to get started"
              description="Your application history will appear here once you apply."
              action={
                <Link href="/jobs" className="text-sm font-semibold text-[var(--brand-blue)]">
                  Browse jobs →
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SeekerDashboardPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <SeekerDashboardContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
