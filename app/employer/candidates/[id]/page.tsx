"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Download, Mail, MapPin, MessageSquare, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { TimelineDisplay } from "@/components/profile/timeline-display";
import { UserSkillBadge } from "@/components/user-skill-badge";
import { OpenToWorkBadge } from "@/components/open-to-work-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, Badge } from "@/components/ui/shared";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import usersService from "@/services/users";
import userSkillsService from "@/services/user-skills";
import connectionsService from "@/services/connections";
import conversationsService from "@/services/conversations";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel, resolveMediaUrl } from "@/lib/utils";
import type { ConnectionStatus, User, UserSkill } from "@/types";

function VerifySkillRow({
  userSkill,
  onVerified,
}: {
  userSkill: UserSkill;
  onVerified: (updated: UserSkill) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const updated = await userSkillsService.verify(userSkill.id);
      onVerified(updated);
      toast.success("Skill verified");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <UserSkillBadge userSkill={userSkill} />
      {!userSkill.verified ? (
        <Button type="button" size="sm" variant="outline" loading={loading} onClick={handleVerify}>
          Verify
        </Button>
      ) : null}
    </div>
  );
}

function CandidateProfileContent() {
  const params = useParams();
  const router = useRouter();
  const candidateId = Number(params.id);

  const [candidate, setCandidate] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [connectBusy, setConnectBusy] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);

  useEffect(() => {
    if (!candidateId || Number.isNaN(candidateId)) {
      setLoading(false);
      return;
    }
    usersService
      .getCandidate(candidateId)
      .then(setCandidate)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const handleDownloadPdf = async () => {
    if (!candidate) return;
    setDownloading(true);
    try {
      await usersService.exportCandidatePdf(candidate.id);
      toast.success("Profile PDF downloaded.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleSkillVerified = (updated: UserSkill) => {
    setCandidate((prev) => {
      if (!prev?.skills) return prev;
      return {
        ...prev,
        skills: prev.skills.map((skill) => (skill.id === updated.id ? updated : skill)),
      };
    });
  };

  const setConnection = (connection: ConnectionStatus) => {
    setCandidate((prev) => (prev ? { ...prev, connection } : prev));
  };

  const handleConnect = async () => {
    if (!candidate) return;
    setConnectBusy(true);
    try {
      const row = await connectionsService.request(candidate.id);
      setConnection({
        status: row.status === "accepted" ? "accepted" : "pending",
        connection_id: row.id,
        is_requester: true,
      });
      toast.success(
        row.status === "accepted" ? "Already connected" : "Connection request sent",
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setConnectBusy(false);
    }
  };

  const handleMessage = async () => {
    if (!candidate) return;
    setMessageBusy(true);
    try {
      const conversation = await conversationsService.createWithSeeker(candidate.id);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setMessageBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading candidate profile..." />;
  }

  if (!candidate) {
    return (
      <EmptyState
        title="Candidate not found"
        description="This profile may not exist or is unavailable."
        action={
          <Link href="/employer/candidates" className={buttonVariants()}>
            Back to search
          </Link>
        }
      />
    );
  }

  const skills = candidate.skills ?? [];
  const interests = candidate.interests ?? [];
  const resumeHref = resolveMediaUrl(candidate.resume_url);
  const connection = candidate.connection;
  const connectionStatus = connection?.status ?? "none";

  return (
    <>
      <Link
        href="/employer/candidates"
        className="text-subtle mb-4 inline-flex items-center gap-1 text-sm hover:text-[var(--brand-blue)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to candidates
      </Link>

      <PageHeader
        title={candidate.full_name}
        description="Candidate profile"
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {connectionStatus === "accepted" ? (
              <Button type="button" size="sm" variant="outline" disabled>
                <Check className="h-4 w-4" />
                Connected
              </Button>
            ) : connectionStatus === "pending" ? (
              <Button type="button" size="sm" variant="outline" disabled>
                Pending
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                loading={connectBusy}
                onClick={() => void handleConnect()}
              >
                <UserPlus className="h-4 w-4" />
                Connect
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              loading={messageBusy}
              onClick={() => void handleMessage()}
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button loading={downloading} onClick={() => void handleDownloadPdf()}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-default bg-surface-card">
            <CardContent className="flex gap-5 p-6">
              <Avatar
                src={candidate.avatar_url}
                name={candidate.full_name}
                entityId={candidate.id}
                size="lg"
                openToWork={Boolean(candidate.open_to_work)}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-heading">
                    {candidate.full_name}
                  </h2>
                  {candidate.open_to_work ? <OpenToWorkBadge /> : null}
                </div>
                {candidate.username ? (
                  <Link
                    href={`/u/${candidate.username}`}
                    className="text-subtle mt-1 inline-block text-sm hover:underline"
                  >
                    @{candidate.username}
                  </Link>
                ) : null}
                {candidate.education_level ? (
                  <p className="text-subtle mt-1 text-sm">
                    {formatLabel(candidate.education_level)}
                  </p>
                ) : null}
                <div className="text-subtle mt-3 space-y-1 text-sm">
                  {candidate.location ? (
                    <p className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                    </p>
                  ) : null}
                  <p className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </p>
                  {candidate.phone ? (
                    <p className="inline-flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {candidate.phone}
                    </p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {candidate.bio ? (
            <Card className="border-default bg-surface-card">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-subtle">{candidate.bio}</p>
              </CardContent>
            </Card>
          ) : null}

          {skills.length > 0 ? (
            <Card className="border-default bg-surface-card">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {skills.map((us) => (
                    <VerifySkillRow key={us.id} userSkill={us} onVerified={handleSkillVerified} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-default bg-surface-card">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-subtle text-sm">No skills listed yet.</p>
              </CardContent>
            </Card>
          )}

          <TimelineDisplay
            experiences={candidate.experiences}
            educations={candidate.educations}
            recommendations={candidate.recommendations}
          />

          {interests.length > 0 ? (
            <Card className="border-default bg-surface-card">
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interests.map((ui) => (
                    <Badge key={ui.id} variant="secondary">
                      {ui.interest?.name ?? "Interest"}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="border-default bg-surface-card">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-subtle">Member since</span>
                <span className="font-medium text-heading">
                  {formatDate(candidate.created_at)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-subtle">Status</span>
                <Badge variant={candidate.is_active ? "success" : "danger"}>
                  {candidate.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-subtle">Connection</span>
                <span className="font-medium text-heading capitalize">
                  {connectionStatus === "none" ? "Not connected" : connectionStatus}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-default bg-surface-card">
            <CardHeader>
              <CardTitle className="text-base">Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {resumeHref ? (
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", className: "w-full" })}
                >
                  View resume
                </a>
              ) : (
                <p className="text-subtle text-sm">No resume uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function CandidateProfilePage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <CandidateProfileContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
