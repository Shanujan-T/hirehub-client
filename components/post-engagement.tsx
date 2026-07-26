"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Repeat2, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import postsService from "@/services/posts";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

interface PostEngagementProps {
  post: Post;
  onUpdated?: (post: Post) => void;
  /** When set, Comment navigates here (feed cards). */
  commentHref?: string;
  /** When set, Comment runs this instead of navigating (detail page). */
  onCommentClick?: () => void;
  className?: string;
}

const actionBtnClass =
  "h-9 w-full flex-1 justify-center gap-1.5 px-1.5 text-sm font-medium text-subtle hover:text-heading sm:px-2.5";

const labelClass = "hidden sm:inline";

export function PostEngagement({
  post,
  onUpdated,
  commentHref,
  onCommentClick,
  className,
}: PostEngagementProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(Boolean(post.liked_by_me ?? post.my_reaction === "like"));
  const [likeCount, setLikeCount] = useState(post.like_count ?? post.reaction_count ?? 0);
  const [repostCount, setRepostCount] = useState(post.repost_count ?? 0);
  const commentCount = post.comment_count ?? post.comments?.length ?? 0;

  const ensureAuth = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return false;
    }
    return true;
  };

  const toggleLike = async () => {
    if (!ensureAuth()) return;
    setBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    try {
      if (nextLiked) {
        const res = await postsService.like(post.id);
        setLikeCount(res.like_count);
        setLiked(true);
        onUpdated?.({
          ...post,
          liked_by_me: true,
          like_count: res.like_count,
          reaction_count: res.like_count,
          my_reaction: "like",
        });
      } else {
        const res = await postsService.unlike(post.id);
        setLikeCount(res.like_count);
        setLiked(false);
        onUpdated?.({
          ...post,
          liked_by_me: false,
          like_count: res.like_count,
          reaction_count: res.like_count,
          my_reaction: null,
        });
      }
    } catch (err) {
      setLiked(!nextLiked);
      setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      toast.error(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleComment = () => {
    if (onCommentClick) {
      onCommentClick();
      return;
    }
    if (commentHref) {
      router.push(commentHref);
    }
  };

  return (
    <>
      <div className={cn("flex w-full items-center justify-between gap-1", className)}>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className={cn(actionBtnClass, liked && "text-[#0C44B7] dark:text-[#22d3ee]")}
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <ThumbsUp className={cn("size-4 shrink-0", liked && "fill-current")} aria-hidden />
          <span className={labelClass}>Like</span>
          {likeCount > 0 ? <span className="tabular-nums opacity-80">{likeCount}</span> : null}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={actionBtnClass}
          onClick={handleComment}
          aria-label="Comment"
        >
          <MessageSquare className="size-4 shrink-0" aria-hidden />
          <span className={labelClass}>Comment</span>
          {commentCount > 0 ? (
            <span className="tabular-nums opacity-80">{commentCount}</span>
          ) : null}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className={actionBtnClass}
          onClick={() => {
            if (!ensureAuth()) return;
            setRepostOpen(true);
          }}
          aria-label="Repost"
        >
          <Repeat2 className="size-4 shrink-0" aria-hidden />
          <span className={labelClass}>Repost</span>
          {repostCount > 0 ? (
            <span className="tabular-nums opacity-80">{repostCount}</span>
          ) : null}
        </Button>
      </div>

      <Modal open={repostOpen} onClose={() => setRepostOpen(false)} title="Repost" size="sm">
        <div className="space-y-3">
          <Textarea
            rows={3}
            placeholder="Add an optional comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRepostOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await postsService.repost(post.id, comment.trim() || undefined);
                  toast.success("Reposted to the feed");
                  setRepostCount((c) => c + 1);
                  setRepostOpen(false);
                  setComment("");
                  onUpdated?.({
                    ...post,
                    repost_count: repostCount + 1,
                  });
                } catch (err) {
                  toast.error(getApiErrorMessage(err));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Repost
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
