"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { LoadingState } from "@/app/_components/page-states";
import { ExportButton } from "@/components/export-button";
import { StatusBadge } from "@/components/ui/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import applicationsService from "@/services/applications";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/types";

function ApplicationDetailContent() {
  const params = useParams();
  const id = Number(params.id);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplication = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const data = await applicationsService.getById(id);
      setApplication(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (loading) return <LoadingState message="Loading application..." />;
  if (!application) return <p className="text-sm text-[#DA3753]">Application not found.</p>;

  return (
    <>
      <Link
        href="/admin/applications"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>
      <AdminPageHeader
        title={`Application #${application.id}`}
        description={application.job?.title}
        actions={
          <ExportButton
            label="Export PDF"
            onExport={() => applicationsService.exportPdf(application.id)}
          />
        }
      />

      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{application.seeker?.full_name ?? "Applicant"}</CardTitle>
          <StatusBadge status={application.status} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Job</p>
            <p className="text-heading">{application.job?.title ?? `#${application.job_id}`}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Applied</p>
            <p className="text-heading">{formatDate(application.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Seeker email</p>
            <p className="text-heading">{application.seeker?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Resume</p>
            <p className="text-heading">
              {application.resume_url ? (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0C44B7] hover:underline"
                >
                  View resume
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
          {application.cover_letter ? (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-subtle">Cover letter</p>
              <p className="text-heading mt-1 whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminApplicationDetailPage() {
  return (
    <AdminShell>
      <ApplicationDetailContent />
    </AdminShell>
  );
}
