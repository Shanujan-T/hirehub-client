"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import { EntityAvatar } from "@/components/entity-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatLabel, resolveMediaUrl } from "@/lib/utils";
import type { PublicSeekerProfile } from "@/types";

export default function PublicSeekerProfilePage() {
  const params = useParams();
  const username = String(params.username || "");
  const [profile, setProfile] = useState<PublicSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
                className="size-20 rounded-2xl text-2xl"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-extrabold text-heading">
                  {profile.full_name}
                </h1>
                <p className="text-subtle mt-1 text-sm">@{profile.username}</p>
                {profile.location ? (
                  <p className="text-subtle mt-2 inline-flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </p>
                ) : null}
                {profile.education_level ? (
                  <p className="text-subtle mt-1 text-sm">
                    {formatLabel(profile.education_level)}
                  </p>
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
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_10%,var(--surface-muted))] px-3 py-1 text-xs font-medium text-heading"
                    >
                      {skill.name}
                      {skill.verified ? (
                        <BadgeCheck className="h-3.5 w-3.5 text-[var(--brand-blue)]" />
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {resumeHref ? (
              <a
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                <FileText className="h-4 w-4" />
                View resume
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
