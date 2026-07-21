"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  AdminShell,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/app/admin/_components/admin-shell";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { ExportButton } from "@/components/export-button";
import { ImportDialog } from "@/components/import-dialog";
import { StatusBadge } from "@/components/ui/shared";
import { buttonVariants } from "@/components/ui/button";
import jobsService from "@/services/jobs";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel, formatSalary } from "@/lib/utils";
import type { Job } from "@/types";

function JobsListContent() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsService.list();
      setJobs(data);
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

  return (
    <>
      <AdminPageHeader
        title="Jobs"
        description="Manage job listings across the platform"
        actions={
          <>
            <ExportButton label="Export CSV" onExport={() => jobsService.exportCsv()} />
            <ImportDialog
              title="Import Jobs"
              description="Upload a CSV file to bulk-import jobs."
              onImport={(file) => jobsService.importCsv(file)}
              onSuccess={() => fetchJobs()}
            />
          </>
        }
      />

      {loading ? (
        <LoadingState message="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" />
      ) : (
        <AdminTable headers={["Title", "Company", "Type", "Status", "Salary", "Posted", ""]}>
          {jobs.map((job) => (
            <AdminTableRow
              key={job.id}
              onClick={() => router.push(`/admin/jobs/${job.id}`)}
            >
              <AdminTableCell className="font-medium">{job.title}</AdminTableCell>
              <AdminTableCell>{job.company?.name ?? `#${job.company_id}`}</AdminTableCell>
              <AdminTableCell>{formatLabel(job.job_type)}</AdminTableCell>
              <AdminTableCell>
                <StatusBadge status={job.status} />
              </AdminTableCell>
              <AdminTableCell>{formatSalary(job.salary_min, job.salary_max)}</AdminTableCell>
              <AdminTableCell>{formatDate(job.created_at)}</AdminTableCell>
              <AdminTableCell>
                <Link
                  href={`/admin/jobs/${job.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </>
  );
}

export default function AdminJobsPage() {
  return (
    <AdminShell>
      <JobsListContent />
    </AdminShell>
  );
}
