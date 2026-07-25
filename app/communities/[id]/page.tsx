"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LogIn, LogOut, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { BannerCoverControls } from "@/components/banner-cover-controls";
import { BackLink } from "@/components/back-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/shared";
import { AvatarUpload } from "@/components/avatar-upload";
import { EntityAvatar } from "@/components/entity-avatar";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  cn,
  formatDate,
  formatLabel,
  getMyCommunitiesPath,
  resolveMediaUrl,
} from "@/lib/utils";
import type { Community, Post } from "@/types";

function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, token, user } = useAuth();
  const communityId = Number(params.id);
  const fromMyCommunities = searchParams.get("from") === "my-communities";
  const backHref = fromMyCommunities
    ? getMyCommunitiesPath(user?.role)
    : "/communities";
  const backLabel = fromMyCommunities ? "My Communities" : "All communities";

  const [community, setCommunity] = useState<Community | null>(null);
  const [feed, setFeed] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const isOwner =
    isAuthenticated && user != null && community?.created_by === user.id;
  const isMember = community?.is_member ?? false;

  const loadData = async () => {
    try {
      const [communityData, feedData] = await Promise.all([
        socialService.getCommunityForUser(communityId, isAuthenticated),
        socialService.getCommunityFeed(communityId).catch(() => [] as Post[]),
      ]);
      setCommunity(communityData);
      setFeed(feedData);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!communityId || Number.isNaN(communityId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadData();
  }, [communityId, authLoading, isAuthenticated, token]);

  const handleJoinToggle = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    setJoining(true);
    try {
      if (isMember) {
        await socialService.leaveCommunity(communityId);
        setCommunity((current) =>
          current
            ? {
                ...current,
                is_member: false,
                member_count: Math.max(0, (current.member_count ?? 1) - 1),
              }
            : current,
        );
        toast.success("Left community.");
      } else {
        await socialService.joinCommunity(communityId);
        setCommunity((current) =>
          current
            ? {
                ...current,
                is_member: true,
                member_count: (current.member_count ?? 0) + 1,
              }
            : current,
        );
        toast.success("Joined community!");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <LoadingState message="Loading community..." />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <EmptyState
          icon={Users}
          title="Community not found"
          description="This community may have been removed."
          action={
            <Link href="/communities" className={buttonVariants()}>
              Browse communities
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      {(() => {
        const coverSrc =
          coverPreview || resolveMediaUrl(community.cover_image_url);
        const hasCover = Boolean(coverSrc);

        return (
          <div
            className={cn(
              "relative border-b border-default",
              !hasCover && "hero-gradient",
            )}
          >
            {hasCover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc!}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/45 to-black/25" />
              </>
            ) : null}

            <div className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <BackLink
                  href={backHref}
                  label={`Back to ${backLabel}`}
                  variant="onDark"
                />
                {isOwner ? (
                  <BannerCoverControls
                    hasCover={Boolean(community.cover_image_url) || Boolean(coverPreview)}
                    onPreviewChange={setCoverPreview}
                    onUpload={async (file) => {
                      const updated = await socialService.uploadCommunityCover(
                        community.id,
                        file,
                      );
                      setCommunity(updated);
                    }}
                    onRemove={async () => {
                      const updated = await socialService.updateCommunity(
                        community.id,
                        { cover_image_url: "" },
                      );
                      setCommunity(updated);
                    }}
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-6">
                  <EntityAvatar
                    name={community.name}
                    imageUrl={community.avatar_url}
                    entityId={community.id}
                    communityType={community.type}
                    variant="community"
                    className="size-16 shrink-0 rounded-2xl text-xl sm:size-20 sm:text-2xl"
                  />
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold break-words text-[#FDFDFD] sm:text-3xl">
                      {community.name}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#FDFDFD]/20 px-2.5 py-0.5 text-xs font-medium text-[#FDFDFD]">
                        {formatLabel(community.type)}
                      </span>
                      <span className="text-sm text-[#FDFDFD]/80">
                        {community.member_count ?? 0} members
                      </span>
                      {community.location ? (
                        <span className="flex items-center gap-1 text-sm text-[#FDFDFD]/75">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {community.location}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleJoinToggle}
                  loading={joining}
                  variant={isMember ? "onDarkOutline" : "onDark"}
                  className="w-fit shrink-0 self-start whitespace-nowrap"
                >
                  {isMember ? (
                    <>
                      <LogOut className="h-4 w-4" aria-hidden="true" /> Leave
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" aria-hidden="true" /> Join Community
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-subtle whitespace-pre-wrap text-sm leading-relaxed">
                  {community.description || "No description provided."}
                </p>
                {community.rules && (
                  <div className="mt-4 border-t border-default pt-4">
                    <p className="text-heading mb-2 text-sm font-semibold">Community Rules</p>
                    <p className="text-subtle whitespace-pre-wrap text-sm">{community.rules}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Community logo</CardTitle>
                </CardHeader>
                <CardContent>
                  <AvatarUpload
                    currentImageUrl={community.avatar_url}
                    name={community.name}
                    entityId={community.id}
                    communityType={community.type}
                    variant="community"
                    shape="rounded-square"
                    label="Logo"
                    onUpload={async (file) => {
                      const updated = await socialService.uploadCommunityLogo(
                        community.id,
                        file,
                      );
                      setCommunity(updated);
                      toast.success("Community logo updated");
                    }}
                    onRemove={async () => {
                      const updated = await socialService.updateCommunity(community.id, {
                        avatar_url: "",
                      });
                      setCommunity(updated);
                      toast.success("Community logo removed");
                    }}
                  />
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {community.industry && (
                  <div>
                    <p className="text-subtle text-xs uppercase">Industry</p>
                    <p className="text-heading font-medium">{community.industry}</p>
                  </div>
                )}
                {community.location && (
                  <div>
                    <p className="text-subtle text-xs uppercase">Location</p>
                    <p className="text-heading font-medium">{community.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-subtle text-xs uppercase">Visibility</p>
                  <p className="text-heading font-medium">
                    {community.is_public ? "Public" : "Private"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <hr className="my-12 border-t border-default" />

        <section
          aria-label="Recent posts"
          className="rounded-2xl bg-surface-muted px-4 py-10 sm:px-6"
        >
          <div className="mb-6">
            <h2 className="text-heading text-xl font-bold sm:text-2xl">
              Recent posts
            </h2>
            <p className="text-subtle mt-1 text-sm">
              Latest discussions shared in this community
            </p>
          </div>
          {feed.length === 0 ? (
            <EmptyState
              title="No posts in this community yet"
              description="Be the first to share something."
            />
          ) : (
            <div className="grid gap-3">
              {feed.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className={cn(
                    "group block rounded-xl border border-default border-l-[3px] border-l-[var(--brand-blue)] bg-surface p-4 transition-colors",
                    "hover:border-[var(--brand-blue)]/45",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {post.author && (
                      <Avatar
                        name={post.author.full_name}
                        src={post.author.avatar_url}
                        entityId={post.author.id}
                        size="sm"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-heading font-semibold group-hover:text-[var(--brand-blue)]">
                        {post.title}
                      </h3>
                      <p className="text-subtle mt-1 line-clamp-2 text-sm">{post.body}</p>
                      <p className="text-subtle mt-2 text-xs">
                        {post.author?.full_name}
                        {post.created_at && ` · ${formatDate(post.created_at)}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function CommunityDetailPageWrapper() {
  return (
    <Suspense fallback={<LoadingState message="Loading community..." />}>
      <CommunityDetailPage />
    </Suspense>
  );
}
