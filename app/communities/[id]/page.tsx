"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LogIn, LogOut, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, Badge } from "@/components/ui/shared";
import { AvatarUpload } from "@/components/avatar-upload";
import { EntityAvatar } from "@/components/entity-avatar";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel, getMyCommunitiesPath } from "@/lib/utils";
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
      {community.cover_image_url && (
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${community.cover_image_url})` }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <EntityAvatar
              name={community.name}
              imageUrl={community.avatar_url}
              entityId={community.id}
              communityType={community.type}
              variant="community"
              className="size-16 shrink-0 rounded-2xl text-xl"
            />
            <div>
              <h1 className="text-heading text-2xl font-bold">{community.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge>{formatLabel(community.type)}</Badge>
                <span className="text-subtle text-sm">
                  {community.member_count ?? 0} members
                </span>
                {community.location && (
                  <span className="text-subtle flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5" /> {community.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={handleJoinToggle}
            disabled={joining}
            variant={isMember ? "outline" : "default"}
          >
            {isMember ? (
              <>
                <LogOut className="h-4 w-4" /> Leave
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Join Community
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
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

            <div>
              <h2 className="text-heading mb-4 text-lg font-bold">Recent posts</h2>
              {feed.length === 0 ? (
                <EmptyState
                  title="No posts in this community yet"
                  description="Be the first to share something."
                />
              ) : (
                <div className="space-y-3">
                  {feed.map((post) => (
                    <Link key={post.id} href={`/community/${post.id}`}>
                      <Card className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {post.author && (
                              <Avatar
                                name={post.author.full_name}
                                src={post.author.avatar_url}
                                entityId={post.author.id}
                                size="sm"
                              />
                            )}
                            <div>
                              <h3 className="text-heading font-semibold">{post.title}</h3>
                              <p className="text-subtle line-clamp-2 text-sm">{post.body}</p>
                              <p className="text-subtle mt-1 text-xs">
                                {post.author?.full_name}
                                {post.created_at && ` · ${formatDate(post.created_at)}`}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
