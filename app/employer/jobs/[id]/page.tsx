"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import jobsService from "@/services/jobs";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  formatDate,
  formatLabel,
  formatSalary,
} from "@/lib/utils";
import type { Job, JobStatus } from "@/types";

function JobStatusPill({ status }: { status: JobStatus }) {
  return (
    <span className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)] px-3 py-1 text-xs font-medium capitalize text-[var(--brand-blue)]">
      {formatLabel(status)}
    </span>
  );
}

function EmployerJobDetailContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!jobId || Number.isNaN(jobId)) {
      setLoading(false);
      return;
    }
    jobsService
      .getById(jobId)
      .then(setJob)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (status: JobStatus) => {
    if (!job) return;
    setUpdatingStatus(true);
    try {
      const updated = await jobsService.patchStatus(job.id, { status });
      setJob(updated);
      toast.success(`Job marked as ${formatLabel(status).toLowerCase()}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!job || !window.confirm("Delete this job listing? This cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      await jobsService.delete(job.id);
      toast.success("Job deleted.");
      router.push("/employer/jobs");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading job..." />;
  }

  if (!job) {
    return (
      <EmptyState
        title="Job not found"
        description="This job may have been removed or you don't have access."
        action={
          <Link href="/employer/jobs" className={buttonVariants()}>
            Back to jobs
          </Link>
        }
      />
    );
  }

  const skillNames =
    job.skills
      ?.map((js) => js.skill?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  return (
    <>
      <Link
        href="/employer/jobs"
        className="text-subtle mb-4 inline-flex items-center gap-1 text-sm hover:text-[var(--brand-blue)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <PageHeader
        title={job.title}
        description={job.company?.name ?? "Your company"}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/employer/jobs/${job.id}/applicants`}
              className={buttonVariants()}
            >
              <Users className="h-4 w-4" />
              View applicants
            </Link>
            <Link
              href={`/employer/jobs/${job.id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-default bg-surface-card">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Job overview</CardTitle>
                <JobStatusPill status={job.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-subtle">
                {job.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatLabel(job.job_type)} · {formatLabel(job.experience_level)}
                </span>
              </div>

              <p className="text-lg font-semibold text-heading">
                {formatSalary(job.salary_min, job.salary_max)}
              </p>

              {job.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-subtle">{job.description}</p>
                </div>
              )}

              {skillNames.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-heading">
                    Required skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-md bg-[color-mix(in_srgb,var(--brand-blue)_10%,var(--surface-muted))] px-2.5 py-1 text-xs font-medium text-heading"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-default bg-surface-card">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {job.category && (
                <div className="flex justify-between">
                  <span className="text-subtle">Category</span>
                  <span className="font-medium text-heading">{job.category}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-subtle">Posted</span>
                <span className="font-medium text-heading">
                  {formatDate(job.created_at)}
                </span>
              </div>
              {job.deadline && (
                <div className="flex justify-between">
                  <span className="text-subtle">Deadline</span>
                  <span className="font-medium text-heading">
                    {formatDate(job.deadline)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-default bg-surface-card">
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["open", "closed", "filled"] as JobStatus[]).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={job.status === status ? "default" : "outline"}
                  size="sm"
                  className="w-full capitalize"
                  disabled={updatingStatus || job.status === status}
                  onClick={() => handleStatusChange(status)}
                >
                  {formatLabel(status)}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="destructive"
            className="w-full"
            loading={deleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete job
          </Button>
        </div>
      </div>
    </>
  );
}

export default function EmployerJobDetailPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <EmployerJobDetailContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
