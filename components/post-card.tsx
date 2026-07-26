"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/shared";
import { ContentCoverImage } from "@/components/content-cover-image";
import { PostEngagement } from "@/components/post-engagement";
import { cn, formatDate, formatLabel, resolveMediaUrl } from "@/lib/utils";
import { getPostTypeBadgeClass, getRoleBadgeClass } from "@/lib/post-utils";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const imageSrc = resolveMediaUrl(post.image_url);

  return (
    <Link href={`/community/${post.id}`} className={cn("group block", className)}>
      <article className="overflow-hidden rounded-2xl border border-default bg-surface-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
        {/* 1. Author row */}
        <div className="mb-3 flex items-start gap-3">
          {post.author && (
            <Avatar
              name={post.author.full_name}
              src={post.author.avatar_url}
              entityId={post.author.id}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {post.author && (
                <span className="text-heading text-sm font-semibold">
                  {post.author.full_name}
                </span>
              )}
              {post.author?.role && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    getRoleBadgeClass(post.author.role),
                  )}
                >
                  {formatLabel(post.author.role)}
                </span>
              )}
            </div>
            {post.created_at && (
              <p className="text-subtle mt-0.5 text-xs">{formatDate(post.created_at)}</p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
              getPostTypeBadgeClass(post.type),
            )}
          >
            {formatLabel(post.type)}
          </span>
        </div>

        {/* 2. Title */}
        <h2 className="text-heading line-clamp-2 text-lg font-bold leading-snug">
          {post.title}
        </h2>

        {/* 3. Cover image (flexible aspect; omitted when absent or broken) */}
        {imageSrc ? (
          <ContentCoverImage
            src={imageSrc}
            className="mt-3"
            imgClassName="transition-transform duration-300 group-hover:scale-[1.01]"
          />
        ) : null}

        {/* 4. Body text */}
        <p className="text-subtle mt-3 line-clamp-3 text-sm leading-relaxed">{post.body}</p>

        {/* 5. Engagement: Like · Comment · Repost */}
        <div
          className="mt-4 border-t border-default pt-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <PostEngagement post={post} commentHref={`/community/${post.id}`} />
        </div>
      </article>
    </Link>
  );
}

export default PostCard;
