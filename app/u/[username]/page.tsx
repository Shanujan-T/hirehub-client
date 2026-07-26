"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import { EntityAvatar } from "@/components/entity-avatar";
import { OpenToWorkBadge } from "@/components/open-to-work-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import socialService from "@/services/social";
import connectionsService from "@/services/connections";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatLabel, resolveMediaUrl } from "@/lib/utils";
import type { PublicSeekerProfile } from "@/types";

export default function PublicSeekerProfilePage() {
  const params = useParams();
  const username = String(params.username || "");
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PublicSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [endorsingId, setEndorsingId] = useState<number | null>(null);
  const [connectBusy, setConnectBusy] = useState(false);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    socialService
      .getPublicProfile(username)
      .then(setProfile)
      .catch((err) => {
        setNotFound(true);
        const message = getApiErrorMessage(err);
        if (!message.toLowerCase().includes("not found")) {
          toast.error(message);
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  const canEndorse =
    isAuthenticated &&
    user?.role === "seeker" &&
    profile?.user_id != null &&
    user.id !== profile.user_id;

  const endorse = async (userSkillId: number) => {
    setEndorsingId(userSkillId);
    try {
      const count = await socialService.endorseSkill(userSkillId);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          skills: prev.skills.map((skill) =>
            skill.id === userSkillId
              ? {
                  ...skill,
                  endorsement_count:
                    count ?? (skill.endorsement_count ?? 0) + 1,
                }
              : skill,
          ),
        };
      });
      toast.success("Skill endorsed");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setEndorsingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Profile not found"
          description="This public profile link is invalid or no longer available."
          action={
            <Link href="/jobs" className={buttonVariants()}>
              Browse jobs
            </Link>
          }
        />
      </div>
    );
  }

  const resumeHref = resolveMediaUrl(profile.resume_url);

  return (
    <div className="bg-surface min-h-[70vh] py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Card className="border-default bg-surface-card overflow-hidden">
          <div className="brand-gradient h-2" />
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-start gap-4">
              <EntityAvatar
                name={profile.full_name}
                imageUrl={profile.avatar_url}
                entityId={profile.user_id}
                openToWork={Boolean(profile.open_to_work)}
                className="size-20 rounded-2xl text-2xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-extrabold text-heading">
                    {profile.full_name}
                  </h1>
                  {profile.open_to_work ? <OpenToWorkBadge /> : null}
                </div>
                <p className="text-subtle mt-1 text-sm">@{profile.username}</p>
                {profile.location ? (
                  <p className="text-subtle mt-2 inline-flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {profile.location}
                  </p>
                ) : null}
                {profile.education_level ? (
                  <p className="text-subtle mt-1 text-sm">
                    {formatLabel(profile.education_level)}
                  </p>
                ) : null}
                {isAuthenticated && profile.connection?.status !== "self" ? (
                  <div className="mt-3">
                    {profile.connection?.status === "accepted" ? (
                      <Button type="button" size="sm" variant="outline" disabled>
                        Connected
                      </Button>
                    ) : profile.connection?.status === "pending" ? (
                      <Button type="button" size="sm" variant="outline" disabled>
                        {profile.connection.is_requester ? "Request sent" : "Respond in Network"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={connectBusy || !profile.user_id}
                        onClick={async () => {
                          if (!profile.user_id) return;
                          setConnectBusy(true);
                          try {
                            await connectionsService.request(profile.user_id);
                            setProfile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    connection: {
                                      status: "pending",
                                      connection_id: null,
                                      is_requester: true,
                                    },
                                  }
                                : prev,
                            );
                            toast.success("Connection request sent");
                          } catch (err) {
                            toast.error(getApiErrorMessage(err));
                          } finally {
                            setConnectBusy(false);
                          }
                        }}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ) : !isAuthenticated ? (
                  <div className="mt-3">
                    <Link
                      href="/auth/login"
                      className={buttonVariants({ size: "sm" })}
                    >
                      Sign in to Connect
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>

            {profile.bio ? (
              <p className="text-heading whitespace-pre-wrap text-sm leading-relaxed">
                {profile.bio}
              </p>
            ) : null}

            {profile.skills.length > 0 ? (
              <div>
                <h2 className="text-heading mb-2 text-sm font-semibold">Skills</h2>
                <ul className="space-y-2">
                  {profile.skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-default bg-surface-muted/40 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-heading">
                        {skill.name}
                      </span>
                      {skill.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-blue)]">
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Verified by employer
                        </span>
                      ) : null}
                      <span className="text-subtle text-xs">
                        Endorsed by {skill.endorsement_count ?? 0} peers
                      </span>
                      {canEndorse ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                          disabled={endorsingId === skill.id}
                          onClick={() => endorse(skill.id)}
                          aria-label={`Endorse ${skill.name}`}
                        >
                          {endorsingId === skill.id ? "…" : "Endorse"}
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(profile.experiences?.length ?? 0) > 0 ? (
              <div>
                <h2 className="text-heading mb-2 text-sm font-semibold">Experience</h2>
                <ul className="space-y-3">
                  {profile.experiences!.map((row) => (
                    <li key={row.id} className="rounded-lg border border-default px-3 py-2">
                      <p className="text-sm font-semibold text-heading">{row.job_title}</p>
                      <p className="text-subtle text-xs">{row.company_name}</p>
                      <p className="text-subtle text-xs mt-0.5">
                        {row.start_date?.slice(0, 7)} → {row.end_date?.slice(0, 7) || "Present"}
                      </p>
                      {row.description ? (
                        <p className="text-subtle mt-1 whitespace-pre-wrap text-sm">{row.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(profile.educations?.length ?? 0) > 0 ? (
              <div>
                <h2 className="text-heading mb-2 text-sm font-semibold">Education</h2>
                <ul className="space-y-3">
                  {profile.educations!.map((row) => (
                    <li key={row.id} className="rounded-lg border border-default px-3 py-2">
                      <p className="text-sm font-semibold text-heading">{row.degree}</p>
                      <p className="text-subtle text-xs">{row.institution}</p>
                      {row.field_of_study ? (
                        <p className="text-subtle text-xs">{row.field_of_study}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(profile.recommendations?.length ?? 0) > 0 ? (
              <div>
                <h2 className="text-heading mb-2 text-sm font-semibold">Recommendations</h2>
                <ul className="space-y-3">
                  {profile.recommendations!.map((row) => (
                    <li key={row.id} className="rounded-lg border border-default bg-surface-muted/40 px-3 py-3">
                      <p className="text-sm font-semibold text-heading">{row.author_name}</p>
                      {row.author_title ? (
                        <p className="text-subtle text-xs">{row.author_title}</p>
                      ) : null}
                      <p className="text-subtle mt-2 whitespace-pre-wrap text-sm">{row.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {resumeHref ? (
              <a
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                View resume
                <span className="sr-only">(opens in new tab)</span>
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
