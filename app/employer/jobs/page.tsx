"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import dashboardService from "@/services/dashboard";
import { getApiErrorMessage } from "@/lib/api-client";
import { JOB_STATUSES } from "@/lib/constants";
import {
  cn,
  formatDate,
  formatLabel,
  formatSalary,
} from "@/lib/utils";
import type { EmployerDashboard, Job, JobStatus } from "@/types";

function JobStatusBadge({ status }: { status: JobStatus }) {
  const styles: Record<JobStatus, string> = {
    open: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    closed: "bg-blue-900/15 text-blue-600 dark:text-blue-200",
    filled: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status],
      )}
    >
      {formatLabel(status)}
    </span>
  );
}

function EmployerJobRow({ job }: { job: Job }) {
  return (
    <Card className="border-default bg-surface-card card-hover">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/employer/jobs/${job.id}`}
              className="font-display text-base font-semibold text-heading hover:text-[var(--brand-blue)]"
            >
              {job.title}
            </Link>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-subtle mt-1 text-sm">
            {job.location ?? "Location not specified"} ·{" "}
            {formatLabel(job.job_type)} · {formatSalary(job.salary_min, job.salary_max)}
          </p>
          <p className="text-subtle mt-0.5 text-xs">
            Posted {formatDate(job.created_at)}
            {job.deadline && ` · Deadline ${formatDate(job.deadline)}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/employer/jobs/${job.id}/applicants`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Users className="h-3.5 w-3.5" />
            Applicants
          </Link>
          <Link
            href={`/employer/jobs/${job.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Edit
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EmployerJobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const dashboard = await dashboardService.get();
      if (dashboard.role === "employer") {
        setJobs((dashboard as EmployerDashboard).jobs);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs =
    statusFilter === "all"
      ? jobs
      : jobs.filter((job) => job.status === statusFilter);

  return (
    <>
      <PageHeader
        title="My Jobs"
        description="Manage your job listings and review applicants."
        action={
          <Link href="/employer/jobs/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            Post new job
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-subtle text-sm font-medium">Filter by status:</label>
        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as JobStatus | "all")
          }
          className="w-40"
        >
          <option value="all">All statuses</option>
          {JOB_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </Select>
        <span className="text-subtle text-sm">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <LoadingState message="Loading your jobs..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={jobs.length === 0 ? "No jobs posted yet" : "No jobs match this filter"}
          description={
            jobs.length === 0
              ? "Create your first listing to start hiring."
              : "Try a different status filter."
          }
          action={
            jobs.length === 0 ? (
              <Link href="/employer/jobs/new" className={buttonVariants()}>
                Post a job
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <EmployerJobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}

export default function EmployerJobsPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <EmployerJobsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
