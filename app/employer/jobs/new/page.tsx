"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/app/employer/_components/page-header";
import {
  JobForm,
  type JobFormSubmitData,
} from "@/app/employer/_components/job-form";
import jobsService from "@/services/jobs";
import { getApiErrorMessage } from "@/lib/api-client";

function NewJobContent() {
  const router = useRouter();

  const handleSubmit = async (payload: JobFormSubmitData) => {
    try {
      const job = await jobsService.create(payload);
      toast.success("Job posted successfully!");
      router.push(`/employer/jobs/${job.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  return (
    <>
      <Link
        href="/employer/jobs"
        className="text-subtle mb-4 inline-flex items-center gap-1 text-sm hover:text-[var(--brand-blue)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <PageHeader
        title="Post a New Job"
        description="Create a listing with required skills to attract the right candidates."
      />

      <Card className="border-default bg-surface-card max-w-3xl">
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            submitLabel="Post job"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/employer/jobs")}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function NewJobPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <NewJobContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
