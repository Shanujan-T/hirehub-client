"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Plus, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PostCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/app/_components/page-states";
import { NewPostDialog } from "@/components/community/new-post-dialog";
import { PostCard } from "@/components/post-card";
import postsService from "@/services/posts";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api-client";
import { FEED_POST_TYPES, PAGE_HEADER_BAND } from "@/lib/constants";
import { POST_TYPE_FILTER_ACTIVE, POST_TYPE_FILTER_IDLE } from "@/lib/post-utils";
import { cn, formatLabel } from "@/lib/utils";
import type { Post, PostType, PostsQueryParams } from "@/types";

function TypeFilterPills({
  activeType,
  onChange,
  className,
}: {
  activeType: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange("")}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          !activeType
            ? "border-[#0C44B7] bg-[#0C44B7] text-white"
            : "border-default text-subtle hover:border-[#0C44B7]/40 hover:text-heading",
        )}
      >
        All
      </button>
      {FEED_POST_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            activeType === type ? POST_TYPE_FILTER_ACTIVE[type] : POST_TYPE_FILTER_IDLE[type],
          )}
        >
          {formatLabel(type)}
        </button>
      ))}
    </div>
  );
}

function CommunityFeedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const typeFilter = searchParams.get("type") || "";

  const filters: PostsQueryParams = {
    type: (typeFilter as PostType) || undefined,
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postsService.list(filters);
      setPosts(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filters.type]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      if (isAuthenticated) {
        setDialogOpen(true);
      } else {
        router.push("/auth/login");
      }
      const params = new URLSearchParams(searchParams.toString());
      params.delete("create");
      const qs = params.toString();
      router.replace(`/community${qs ? `?${qs}` : ""}`);
    }
  }, [searchParams, router, isAuthenticated]);

  const handleNewPost = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    setDialogOpen(true);
  };

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("type", value);
    router.push(`/community${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const topContributors = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const post of posts) {
      if (!post.author) continue;
      const key = String(post.author.id);
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { name: post.author.full_name, count: 1 });
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [posts]);

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <div className={cn("border-b border-default", PAGE_HEADER_BAND)}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-10 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-heading text-3xl font-bold">Feed</h1>
            <p className="text-subtle mt-1">
              Share insights, ask questions, and connect with professionals
            </p>
          </div>
          <Button onClick={handleNewPost}>
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
          <div className="sticky top-24 space-y-6">
            <div>
              <h2 className="text-heading mb-3 text-sm font-semibold uppercase tracking-wide">
                Filter by type
              </h2>
              <TypeFilterPills
                activeType={typeFilter}
                onChange={handleTypeChange}
                className="flex-col items-stretch"
              />
            </div>

            <div className="rounded-2xl border border-default bg-surface-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="size-4 text-[#0C44B7]" />
                <h3 className="text-heading text-sm font-semibold">Feed Guidelines</h3>
              </div>
              <ul className="text-subtle space-y-2 text-xs leading-relaxed">
                <li>Be respectful and constructive in discussions.</li>
                <li>Share accurate job leads and learning resources.</li>
                <li>No spam, harassment, or misleading content.</li>
              </ul>
            </div>

            {topContributors.length > 0 && (
              <div className="rounded-2xl border border-default bg-surface-card p-4">
                <h3 className="text-heading mb-3 text-sm font-semibold">Top contributors</h3>
                <ul className="space-y-2">
                  {topContributors.map((contributor) => (
                    <li
                      key={contributor.name}
                      className="text-subtle flex items-center justify-between text-xs"
                    >
                      <span className="text-heading truncate font-medium">{contributor.name}</span>
                      <span>{contributor.count} posts</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 max-w-3xl">
          <div className="mb-6 lg:hidden">
            <TypeFilterPills activeType={typeFilter} onChange={handleTypeChange} />
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={
                typeFilter
                  ? "No posts yet in this category"
                  : "No posts yet"
              }
              description={
                typeFilter
                  ? "Be the first to share in this category."
                  : "Be the first to share something on the feed."
              }
              action={
                <Button onClick={handleNewPost}>Create a post</Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>

      <NewPostDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={fetchPosts}
      />
    </div>
  );
}

export default function CommunityFeedPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <CommunityFeedPage />
    </Suspense>
  );
}
