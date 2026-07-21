"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { JobCard } from "@/components/cards/index";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Job } from "@/types";

function SavedJobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialService
      .getSavedJobs()
      .then((saved) => setJobs(saved.map((s) => s.job).filter(Boolean) as Job[]))
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading saved jobs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Saved Jobs</h1>
        <p className="text-subtle mt-1">Jobs you bookmarked for later</p>
      </div>
      {jobs.length === 0 ? (
        <EmptyState title="No saved jobs" description="Save jobs from the job detail page." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <SavedJobsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
