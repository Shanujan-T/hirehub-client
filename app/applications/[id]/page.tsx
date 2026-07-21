"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { StatusHistoryTimeline } from "@/components/status-history-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/shared";
import { LoadingState } from "@/app/_components/page-states";
import applicationsService from "@/services/applications";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Application, ApplicationStatusLog } from "@/types";

function ApplicationDetailContent() {
  const params = useParams();
  const id = Number(params.id);
  const [app, setApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationStatusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    Promise.all([
      applicationsService.getById(id),
      applicationsService.getHistory(id),
    ])
      .then(([application, statusHistory]) => {
        setApp(application);
        setHistory(statusHistory);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const withdraw = async () => {
    setWithdrawing(true);
    try {
      const updated = await applicationsService.withdraw(id);
      setApp(updated);
      const statusHistory = await applicationsService.getHistory(id);
      setHistory(statusHistory);
      toast.success("Application withdrawn");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setWithdrawing(false);
    }
  };

  const downloadPdf = async () => {
    try {
      await applicationsService.exportPdf(id);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState />;
  if (!app) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/applications" className="text-subtle inline-flex items-center gap-2 text-sm hover:text-heading">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-heading">{app.job?.title}</h1>
          <p className="text-subtle mt-1">{app.job?.company?.name}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>
      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Application details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p><span className="text-subtle">Applied:</span> {formatDate(app.created_at)}</p>
          {app.cover_letter && (
            <div>
              <p className="text-subtle mb-1">Cover letter</p>
              <p className="whitespace-pre-wrap text-heading">{app.cover_letter}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            {["pending", "shortlisted"].includes(app.status) && (
              <Button variant="destructive" onClick={withdraw} disabled={withdrawing}>
                {withdrawing ? "Withdrawing..." : "Withdraw"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Status history</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusHistoryTimeline history={history} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <ApplicationDetailContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
