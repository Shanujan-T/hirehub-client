"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingState, EmptyState, FormGroup } from "@/app/_components/page-states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/shared";
import { useAuth } from "@/providers/auth-provider";
import postsService from "@/services/posts";
import { getApiErrorMessage } from "@/lib/api-client";
import { getPostTypeBadgeClass, getRoleBadgeClass } from "@/lib/post-utils";
import { cn, formatDate, formatLabel, resolveMediaUrl } from "@/lib/utils";
import type { Comment, Post } from "@/types";

const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
});

type CommentForm = z.infer<typeof commentSchema>;

export default function PostDetailPage() {
  const params = useParams();
  const postId = Number(params.id);
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentForm>({ resolver: zodResolver(commentSchema) });

  const loadPost = async () => {
    try {
      const data = await postsService.getById(postId);
      setPost(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId || Number.isNaN(postId)) {
      setLoading(false);
      return;
    }
    loadPost();
  }, [postId]);

  const onComment = async (data: CommentForm) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to comment.");
      return;
    }
    setSubmitting(true);
    try {
      await postsService.createComment(postId, { body: data.body });
      reset();
      toast.success("Comment added.");
      await loadPost();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment.id}
      className={depth > 0 ? "ml-8 mt-3 border-l-2 border-[#0C44B7]/20 pl-4" : ""}
    >
      <div className="flex gap-3">
        {comment.author && (
          <Avatar name={comment.author.full_name} src={comment.author.avatar_url} size="sm" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-heading text-sm font-semibold">
              {comment.author?.full_name ?? "Anonymous"}
            </span>
            {comment.created_at && (
              <span className="text-subtle text-xs">{formatDate(comment.created_at)}</span>
            )}
          </div>
          <p className="text-subtle mt-1 text-sm">{comment.body}</p>
          {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <LoadingState message="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <EmptyState
          icon={MessageSquare}
          title="Post not found"
          description="This post may have been removed."
          action={
            <Link href="/community" className={buttonVariants()}>
              Back to feed
            </Link>
          }
        />
      </div>
    );
  }

  const comments = post.comments ?? [];
  const imageSrc = resolveMediaUrl(post.image_url);

  return (
    <div className="bg-surface min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/community"
          className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Link>

        <Card className="mb-6 overflow-hidden">
          {imageSrc && (
            <button
              type="button"
              className="block w-full cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              aria-label="Expand post image"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt=""
                className="max-h-96 w-full object-contain bg-[color-mix(in_srgb,var(--text-subtle)_8%,transparent)]"
              />
            </button>
          )}
          <CardContent className="p-6">
            <div className="mb-4 flex items-start gap-3">
              {post.author && (
                <Avatar name={post.author.full_name} src={post.author.avatar_url} />
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
                <p className="text-subtle mt-1 text-sm">
                  {post.created_at && formatDate(post.created_at)}
                </p>
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
            <h1 className="text-heading text-2xl font-bold">{post.title}</h1>
            <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-[#133099]/90 dark:text-heading/90">
              {post.body}
            </div>
            {post.link_url && (
              <a
                href={post.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-[#0C44B7] hover:underline"
              >
                {post.link_url}
              </a>
            )}
          </CardContent>
        </Card>

        {imageSrc && (
          <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} size="lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={post.title}
              className="-mt-2 max-h-[70vh] w-full rounded-xl object-contain"
            />
          </Modal>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAuthenticated ? (
              <form onSubmit={handleSubmit(onComment)} className="space-y-3">
                <FormGroup label="Add a comment">
                  <Textarea
                    {...register("body")}
                    rows={3}
                    placeholder="Share your thoughts..."
                    error={errors.body?.message}
                  />
                </FormGroup>
                <Button type="submit" size="sm" loading={submitting}>
                  <Send className="h-4 w-4" />
                  Post Comment
                </Button>
              </form>
            ) : (
              <p className="text-subtle text-sm">
                <Link href="/auth/login" className="font-medium text-[#0C44B7] hover:underline">
                  Sign in
                </Link>{" "}
                to join the conversation.
              </p>
            )}

            {comments.length === 0 ? (
              <EmptyState title="No comments yet" description="Start the conversation below." />
            ) : (
              <div className="space-y-4 border-t border-default pt-4">
                {comments.map((comment) => renderComment(comment))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
