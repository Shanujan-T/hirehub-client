"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  FileText,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/shared";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import dashboardService from "@/services/dashboard";
import { getApiErrorMessage } from "@/lib/api-client";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { formatDate, formatLabel } from "@/lib/utils";
import type { EmployerDashboard } from "@/types";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number | string;
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

function EmployerDashboardContent() {
  const [data, setData] = useState<EmployerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .get()
      .then((dashboard) => {
        if (dashboard.role === "employer") {
          setData(dashboard);
        }
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Unable to load dashboard"
        description="Please try refreshing the page."
      />
    );
  }

  const totalApplicants = Object.values(data.applicants_by_status).reduce(
    (sum, n) => sum + n,
    0,
  );
  const pendingCount = data.applicants_by_status.pending ?? 0;

  return (
    <>
      <PageHeader
        title="Employer Dashboard"
        description="Overview of your jobs, applicants, and company profile."
        action={
          <Link href="/employer/jobs/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            Post a job
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active jobs"
          value={data.jobs_count}
          icon={Briefcase}
          href="/employer/jobs"
        />
        <StatCard
          label="Total applicants"
          value={totalApplicants}
          icon={Users}
        />
        <StatCard
          label="Pending review"
          value={pendingCount}
          icon={FileText}
        />
        <StatCard
          label="Company"
          value={data.company?.name ?? "Not set up"}
          icon={Building2}
          href="/employer/company"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-default bg-surface-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Applicants by status</CardTitle>
          </CardHeader>
          <CardContent>
            {totalApplicants === 0 ? (
              <p className="text-subtle text-sm">No applicants yet.</p>
            ) : (
              <div className="space-y-3">
                {APPLICATION_STATUSES.filter((s) => s !== "withdrawn").map(
                  (status) => {
                    const count = data.applicants_by_status[status] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg bg-surface-muted px-4 py-2"
                      >
                        <StatusBadge status={status} />
                        <span className="font-semibold text-heading">{count}</span>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-default bg-surface-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent jobs</CardTitle>
            <Link
              href="/employer/jobs"
              className="text-sm font-medium text-[var(--brand-blue)] hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {data.jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Post your first job to start hiring"
                description="Create a listing and start receiving applications from candidates."
                action={
                  <Link href="/employer/jobs/new" className={buttonVariants()}>
                    Post a job
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-default">
                {data.jobs.slice(0, 5).map((job) => (
                  <li key={job.id} className="flex items-center justify-between py-3">
                    <Link
                      href={`/employer/jobs/${job.id}`}
                      className="font-medium text-heading hover:text-[var(--brand-blue)]"
                    >
                      {job.title}
                    </Link>
                    <span className="text-subtle text-xs capitalize">
                      {formatLabel(job.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {data.applications.length > 0 && (
        <Card className="border-default bg-surface-card mt-6">
          <CardHeader>
            <CardTitle>Recent applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-default">
              {data.applications.slice(0, 8).map((app) => (
                <li
                  key={app.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-medium text-heading">
                      {app.seeker?.full_name ?? "Candidate"}
                    </p>
                    <p className="text-subtle text-sm">
                      {app.job?.title ?? "Job"} · {formatDate(app.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                    {app.job_id && (
                      <Link
                        href={`/employer/jobs/${app.job_id}/applicants`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Review
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function EmployerDashboardPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <EmployerDashboardContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
