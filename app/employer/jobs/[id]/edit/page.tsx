"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import {
  JobForm,
  jobToFormValues,
  type JobFormSubmitData,
} from "@/app/employer/_components/job-form";
import jobsService from "@/services/jobs";
import { getApiErrorMessage } from "@/lib/api-client";
import { buttonVariants } from "@/components/ui/button";
import type { Job } from "@/types";

function EditJobContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (payload: JobFormSubmitData) => {
    if (!job) return;
    try {
      const updated = await jobsService.update(job.id, payload);
      toast.success("Job updated successfully!");
      router.push(`/employer/jobs/${updated.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
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

  return (
    <>
      <Link
        href={`/employer/jobs/${job.id}`}
        className="text-subtle mb-4 inline-flex items-center gap-1 text-sm hover:text-[var(--brand-blue)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to job
      </Link>

      <PageHeader
        title="Edit Job"
        description={`Update details for "${job.title}"`}
      />

      <Card className="border-default bg-surface-card max-w-3xl">
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            defaultValues={jobToFormValues(job)}
            existingImageUrl={job.image_url}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/employer/jobs/${job.id}`)}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function EditJobPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <EditJobContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
