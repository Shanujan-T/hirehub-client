"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/shared";
import { cn, formatDate, formatLabel, resolveMediaUrl } from "@/lib/utils";
import { getPostTypeBadgeClass, getRoleBadgeClass } from "@/lib/post-utils";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const imageSrc = resolveMediaUrl(post.image_url);
  const commentCount = post.comment_count ?? post.comments?.length ?? 0;

  return (
    <Link href={`/community/${post.id}`} className={cn("group block", className)}>
      <article className="overflow-hidden rounded-2xl border border-default bg-surface-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
        {imageSrc && (
          <div className="aspect-video w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="p-5">
          <div className="mb-3 flex items-start gap-3">
            {post.author && (
              <Avatar name={post.author.full_name} src={post.author.avatar_url} entityId={post.author.id} />
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

          <h2 className="text-heading line-clamp-2 text-lg font-bold leading-snug">
            {post.title}
          </h2>
          <p className="text-subtle mt-2 line-clamp-3 text-sm leading-relaxed">{post.body}</p>

          <div className="mt-4 flex items-center justify-between border-t border-default pt-3">
            <div className="text-subtle flex items-center gap-1.5 text-sm">
              <MessageSquare className="size-4" aria-hidden />
              <span>
                {commentCount} {commentCount === 1 ? "comment" : "comments"}
              </span>
            </div>
            <span className="text-sm font-medium text-[#0C44B7] transition-colors group-hover:text-[#AB2F74] dark:text-[#22d3ee]">
              View discussion →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default PostCard;
