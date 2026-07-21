"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
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
import { StatusBadge } from "@/components/ui/shared";
import applicationsService from "@/services/applications";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/types";

function ApplicationsListContent() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationsService.list();
      setApplications(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <>
      <AdminPageHeader
        title="Applications"
        description="Review job applications platform-wide"
        actions={
          <ExportButton
            label="Export CSV"
            onExport={() => applicationsService.exportCsv()}
          />
        }
      />

      {loading ? (
        <LoadingState message="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState icon={FileText} title="No applications found" />
      ) : (
        <AdminTable headers={["Applicant", "Job", "Status", "Applied", ""]}>
          {applications.map((app) => (
            <AdminTableRow
              key={app.id}
              onClick={() => router.push(`/admin/applications/${app.id}`)}
            >
              <AdminTableCell className="font-medium">
                {app.seeker?.full_name ?? `User #${app.seeker_id}`}
              </AdminTableCell>
              <AdminTableCell>{app.job?.title ?? `Job #${app.job_id}`}</AdminTableCell>
              <AdminTableCell>
                <StatusBadge status={app.status} />
              </AdminTableCell>
              <AdminTableCell>{formatDate(app.created_at)}</AdminTableCell>
              <AdminTableCell>
                <Link
                  href={`/admin/applications/${app.id}`}
                  className="text-sm font-medium text-[#0C44B7] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </>
  );
}

export default function AdminApplicationsPage() {
  return (
    <AdminShell>
      <ApplicationsListContent />
    </AdminShell>
  );
}
