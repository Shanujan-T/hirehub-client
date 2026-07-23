"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  AdminShell,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/app/admin/_components/admin-shell";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { Badge } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/card";
import { ConversationThread } from "@/components/conversation-thread";
import reportsService from "@/services/reports";
import { getApiErrorMessage } from "@/lib/api-client";
import { REPORT_STATUSES } from "@/lib/constants";
import { formatDate, formatLabel } from "@/lib/utils";
import type { Report, ReportDetail, ReportStatus } from "@/types";

function ReportsContent() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [selected, setSelected] = useState<Report | null>(null);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [resolveStatus, setResolveStatus] = useState<ReportStatus>("actioned");
  const [actionTaken, setActionTaken] = useState("");
  const [resolving, setResolving] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsService.list(
        statusFilter ? { status: statusFilter as ReportStatus } : undefined,
      );
      setReports(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (!selected) {
      setReportDetail(null);
      return;
    }
    if (
      selected.target_type !== "conversation" &&
      selected.target_type !== "message"
    ) {
      setReportDetail(null);
      return;
    }
    setLoadingDetail(true);
    reportsService
      .getById(selected.id)
      .then((data) => setReportDetail(data))
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoadingDetail(false));
  }, [selected]);

  async function handleResolve() {
    if (!selected) return;
    setResolving(true);
    try {
      await reportsService.resolve(selected.id, {
        status: resolveStatus,
        action_taken: actionTaken || undefined,
      });
      toast.success("Report resolved");
      setSelected(null);
      setActionTaken("");
      fetchReports();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setResolving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Moderation Reports"
        description="Review and resolve user-submitted reports"
      />

      <div className="mb-6 max-w-xs">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {REPORT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <LoadingState message="Loading reports..." />
      ) : reports.length === 0 ? (
        <EmptyState icon={Flag} title="No reports found" />
      ) : (
        <AdminTable headers={["Target", "Reason", "Status", "Reported", ""]}>
          {reports.map((report) => (
            <AdminTableRow key={report.id}>
              <AdminTableCell>
                <span className="font-medium">{formatLabel(report.target_type)}</span>
                <span className="text-subtle ml-1">#{report.target_id}</span>
              </AdminTableCell>
              <AdminTableCell className="max-w-xs truncate">{report.reason}</AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={
                    report.status === "open"
                      ? "warning"
                      : report.status === "actioned"
                        ? "success"
                        : "outline"
                  }
                >
                  {formatLabel(report.status)}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>{formatDate(report.created_at)}</AdminTableCell>
              <AdminTableCell>
                <div className="flex gap-2">
                  {(report.target_type === "conversation" ||
                    report.target_type === "message") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(report)}
                    >
                      View
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={report.status !== "open"}
                    onClick={() => {
                      setSelected(report);
                      setResolveStatus("actioned");
                      setActionTaken("");
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={
          selected?.status === "open" && selected
            ? "Resolve Report"
            : "Report details"
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-default bg-surface-muted p-3 text-sm">
              <p>
                <span className="font-medium">Target:</span>{" "}
                {formatLabel(selected.target_type)} #{selected.target_id}
              </p>
              <p className="mt-1">
                <span className="font-medium">Reason:</span> {selected.reason}
              </p>
              {selected.details ? (
                <p className="text-subtle mt-1">{selected.details}</p>
              ) : null}
            </div>

            {(selected.target_type === "conversation" ||
              selected.target_type === "message") && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-heading">
                  Reported conversation (read-only)
                </p>
                {loadingDetail ? (
                  <LoadingState message="Loading conversation..." />
                ) : reportDetail?.conversation ? (
                  <ConversationThread
                    conversationId={reportDetail.conversation.id}
                    conversation={reportDetail.conversation}
                    readOnly
                    adminReadOnly
                  />
                ) : null}
              </div>
            )}

            {selected.status === "open" ? (
              <>
                <div>
                  <label className="text-sm font-medium text-heading">Resolution</label>
                  <Select
                    className="mt-2"
                    value={resolveStatus}
                    onChange={(e) => setResolveStatus(e.target.value as ReportStatus)}
                  >
                    {REPORT_STATUSES.filter((s) => s !== "open").map((status) => (
                      <option key={status} value={status}>
                        {formatLabel(status)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-heading">Action taken</label>
                  <Textarea
                    className="mt-2"
                    rows={3}
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="Describe moderation action..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setSelected(null)}>
                    Cancel
                  </Button>
                  <Button loading={resolving} onClick={handleResolve}>
                    Confirm Resolution
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default function AdminReportsPage() {
  return (
    <AdminShell>
      <ReportsContent />
    </AdminShell>
  );
}
