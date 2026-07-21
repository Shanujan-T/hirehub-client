"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { LoadingState } from "@/app/_components/page-states";
import { ExportButton } from "@/components/export-button";
import { StatusBadge } from "@/components/ui/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import jobsService from "@/services/jobs";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel, formatSalary } from "@/lib/utils";
import { JOB_STATUSES } from "@/lib/constants";
import type { Job, JobStatus } from "@/types";

function JobDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchJob = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const data = await jobsService.getById(id);
      setJob(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  async function handleStatusChange(status: JobStatus) {
    if (!job) return;
    setStatusLoading(true);
    try {
      const updated = await jobsService.patchStatus(job.id, { status });
      setJob(updated);
      toast.success(`Job marked as ${formatLabel(status)}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleDelete() {
    if (!job || !confirm("Delete this job listing?")) return;
    try {
      await jobsService.delete(job.id);
      toast.success("Job deleted");
      router.push("/admin/jobs");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (loading) return <LoadingState message="Loading job..." />;
  if (!job) return <p className="text-sm text-[#DA3753]">Job not found.</p>;

  return (
    <>
      <Link
        href="/admin/jobs"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>
      <AdminPageHeader
        title={job.title}
        description={job.company?.name}
        actions={
          <>
            <ExportButton label="Export PDF" onExport={() => jobsService.exportPdf(job.id)} />
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{job.title}</CardTitle>
          <StatusBadge status={job.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Type</p>
              <p className="text-heading">{formatLabel(job.job_type)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Experience</p>
              <p className="text-heading">{formatLabel(job.experience_level)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Location</p>
              <p className="text-heading">{job.location ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Salary</p>
              <p className="text-heading">{formatSalary(job.salary_min, job.salary_max)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Deadline</p>
              <p className="text-heading">{formatDate(job.deadline)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Posted</p>
              <p className="text-heading">{formatDate(job.created_at)}</p>
            </div>
          </div>

          {job.description ? (
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Description</p>
              <p className="text-heading mt-1 whitespace-pre-wrap">{job.description}</p>
            </div>
          ) : null}

          {job.skills?.length ? (
            <div>
              <p className="text-xs font-medium uppercase text-subtle">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills.map((js) => (
                  <span
                    key={js.id}
                    className="rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)] px-3 py-1 text-xs font-medium text-heading"
                  >
                    {js.skill?.name ?? `Skill #${js.skill_id}`}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-subtle mb-2 text-sm">Change status</p>
            <div className="flex flex-wrap gap-2">
              {JOB_STATUSES.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={job.status === status ? "default" : "outline"}
                  loading={statusLoading && job.status !== status}
                  disabled={job.status === status}
                  onClick={() => handleStatusChange(status)}
                >
                  {formatLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminJobDetailPage() {
  return (
    <AdminShell>
      <JobDetailContent />
    </AdminShell>
  );
}
