"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Mail, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ScheduleInterviewForm } from "@/components/interview-scheduling";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form";
import { Avatar, StatusBadge } from "@/components/ui/shared";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import jobsService from "@/services/jobs";
import applicationsService from "@/services/applications";
import conversationsService from "@/services/conversations";
import aiService from "@/services/ai";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn, formatDate } from "@/lib/utils";
import type { Application, Job } from "@/types";

function ApplicantActions({
  application,
  onUpdate,
}: {
  application: Application;
  onUpdate: (updated: Application) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const runAction = async (
    action: "shortlist" | "accept" | "reject",
    label: string,
  ) => {
    setLoading(action);
    try {
      let updated: Application;
      if (action === "shortlist") {
        updated = await applicationsService.shortlist(application.id);
      } else if (action === "accept") {
        updated = await applicationsService.accept(application.id);
      } else {
        updated = await applicationsService.reject(application.id, {
          rejection_reason: rejectionReason.trim() || undefined,
        });
        setShowRejectForm(false);
        setRejectionReason("");
      }
      onUpdate({ ...updated, interview: updated.interview ?? application.interview });
      toast.success(`Application ${label}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const handleInterviewScheduled = (updated: Application) => {
    onUpdate(updated);
  };

  const { status } = application;

  if (status === "accepted" || status === "rejected" || status === "withdrawn") {
    return (
      <p className="text-subtle text-xs">
        Final status — no further actions
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <Button
            type="button"
            size="sm"
            loading={loading === "shortlist"}
            disabled={Boolean(loading)}
            onClick={() => runAction("shortlist", "shortlisted")}
          >
            Shortlist
          </Button>
        )}
        {(status === "pending" || status === "shortlisted") && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={loading === "accept"}
            disabled={Boolean(loading)}
            onClick={() => runAction("accept", "accepted")}
          >
            Accept
          </Button>
        )}
        {(status === "pending" || status === "shortlisted") && !showRejectForm && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={Boolean(loading)}
            onClick={() => setShowRejectForm(true)}
          >
            Reject
          </Button>
        )}
      </div>

      {showRejectForm ? (
        <div className="space-y-2 rounded-lg border border-default bg-surface-muted p-3">
          <Label htmlFor={`reject-reason-${application.id}`}>
            Add a reason (optional) — visible to the candidate
          </Label>
          <Input
            id={`reject-reason-${application.id}`}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Role filled internally"
            maxLength={200}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              loading={loading === "reject"}
              onClick={() => runAction("reject", "rejected")}
            >
              Confirm reject
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <ScheduleInterviewForm application={application} onScheduled={handleInterviewScheduled} />
    </div>
  );
}

function ApplicantRow({
  application,
  selected,
  onToggle,
  onUpdate,
}: {
  application: Application;
  selected: boolean;
  onToggle: (id: number) => void;
  onUpdate: (updated: Application) => void;
}) {
  const router = useRouter();
  const seeker = application.seeker;
  const [openingMessage, setOpeningMessage] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const selectable = ["pending", "shortlisted"].includes(application.status);

  const openMessage = async () => {
    setOpeningMessage(true);
    try {
      const conversation = await conversationsService.createForApplication(application.id);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setOpeningMessage(false);
    }
  };

  const loadSummary = async () => {
    setSummarizing(true);
    try {
      const result = await aiService.summarizeCandidate(application.id);
      onUpdate({ ...application, ai_summary: result.summary });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <Card className={cn("border-default bg-surface-card", selected && "ring-1 ring-[var(--brand-blue)]/40")}>
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          {selectable ? (
            <input
              type="checkbox"
              className="mt-2 h-4 w-4 accent-[var(--brand-blue)]"
              checked={selected}
              onChange={() => onToggle(application.id)}
              aria-label={`Select ${seeker?.full_name ?? "applicant"}`}
            />
          ) : (
            <div className="mt-2 w-4" />
          )}
          <Avatar
            src={seeker?.avatar_url}
            name={seeker?.full_name ?? "Candidate"}
            entityId={seeker?.id}
            size="lg"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-heading">
                {seeker?.full_name ?? "Unknown candidate"}
              </h3>
              <StatusBadge status={application.status} />
            </div>
            {application.ai_summary ? (
              <p className="text-subtle mt-1 text-sm leading-relaxed">
                {application.ai_summary}
              </p>
            ) : (
              <button
                type="button"
                className="text-subtle mt-1 inline-flex items-center gap-1 text-xs hover:text-heading"
                disabled={summarizing}
                onClick={() => void loadSummary()}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {summarizing ? "Summarizing…" : "Generate AI summary"}
              </button>
            )}
            <p className="text-subtle text-sm">
              Applied {formatDate(application.created_at)}
            </p>
            {seeker?.location && (
              <p className="text-subtle text-sm">{seeker.location}</p>
            )}
            {seeker?.bio && (
              <p className="text-subtle mt-2 line-clamp-2 text-sm">{seeker.bio}</p>
            )}
            {application.cover_letter && (
              <p className="text-subtle mt-2 line-clamp-3 text-sm italic">
                &ldquo;{application.cover_letter}&rdquo;
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                loading={openingMessage}
                onClick={openMessage}
              >
                <Mail className="h-3.5 w-3.5" />
                Message
              </Button>
              {seeker?.id && (
                <Link
                  href={`/employer/candidates/${seeker.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <User className="h-3.5 w-3.5" />
                  View profile
                </Link>
              )}
              {application.resume_url && (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Resume
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 lg:min-w-[180px]">
          <ApplicantActions application={application} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  );
}

function JobApplicantsContent() {
  const params = useParams();
  const jobId = Number(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<"shortlisted" | "rejected" | null>(null);

  const selectableIds = useMemo(
    () =>
      applications
        .filter((app) => ["pending", "shortlisted"].includes(app.status))
        .map((app) => app.id),
    [applications],
  );

  const fetchData = useCallback(async () => {
    if (!jobId || Number.isNaN(jobId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [jobData, apps] = await Promise.all([
        jobsService.getById(jobId),
        jobsService.getApplications(jobId),
      ]);
      setJob(jobData);
      setApplications(apps);
      setSelectedIds([]);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplicationUpdate = (updated: Application) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updated.id ? updated : app)),
    );
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : selectableIds);
  };

  const runBulk = async (status: "shortlisted" | "rejected") => {
    if (!selectedIds.length) return;
    if (
      status === "rejected" &&
      !window.confirm(`Reject ${selectedIds.length} selected application(s)?`)
    ) {
      return;
    }
    setBulkLoading(status);
    try {
      const updated = await jobsService.bulkUpdateApplicants(jobId, {
        application_ids: selectedIds,
        status,
      });
      setApplications((prev) =>
        prev.map((app) => updated.find((u) => u.id === app.id) ?? app),
      );
      setSelectedIds([]);
      toast.success(`${updated.length} application(s) ${status}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setBulkLoading(null);
    }
  };

  const handleExport = async () => {
    if (!jobId || Number.isNaN(jobId)) return;
    setExporting(true);
    try {
      await jobsService.exportApplicantsCsv(jobId);
      toast.success("Applicants exported");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading applicants..." />;
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
        title="Applicants"
        description={`Review candidates for "${job.title}"`}
        action={
          applications.length > 0 ? (
            <Button variant="outline" loading={exporting} onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <Card className="border-default bg-surface-card mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {applications.length} applicant{applications.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-subtle text-sm">
            Shortlist promising candidates, then accept or reject. Accepted and
            rejected applications are final.
          </p>
          {selectableIds.length > 0 ? (
            <label className="inline-flex items-center gap-2 text-sm text-heading">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--brand-blue)]"
                checked={allSelected}
                onChange={toggleAll}
              />
              Select all actionable ({selectableIds.length})
            </label>
          ) : null}
        </CardContent>
      </Card>

      {selectedIds.length > 0 ? (
        <div className="sticky top-20 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface-card px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-heading">
            {selectedIds.length} selected
          </p>
          <Button
            size="sm"
            loading={bulkLoading === "shortlisted"}
            disabled={Boolean(bulkLoading)}
            onClick={() => void runBulk("shortlisted")}
          >
            Shortlist
          </Button>
          <Button
            size="sm"
            variant="destructive"
            loading={bulkLoading === "rejected"}
            disabled={Boolean(bulkLoading)}
            onClick={() => void runBulk("rejected")}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={Boolean(bulkLoading)}
            onClick={() => setSelectedIds([])}
          >
            Clear
          </Button>
        </div>
      ) : null}

      {applications.length === 0 ? (
        <EmptyState
          icon={User}
          title="No applicants yet"
          description="Share your job listing to start receiving applications."
        />
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <ApplicantRow
              key={application.id}
              application={application}
              selected={selectedIds.includes(application.id)}
              onToggle={toggleOne}
              onUpdate={handleApplicationUpdate}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function JobApplicantsPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <JobApplicantsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
