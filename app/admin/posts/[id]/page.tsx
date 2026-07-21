"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { LoadingState } from "@/app/_components/page-states";
import { Badge } from "@/components/ui/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import postsService from "@/services/posts";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel } from "@/lib/utils";
import type { Post } from "@/types";

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const data = await postsService.getById(id);
      setPost(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  async function handleDelete() {
    if (!post || !confirm("Delete this post?")) return;
    try {
      await postsService.delete(post.id);
      toast.success("Post deleted");
      router.push("/admin/posts");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (loading) return <LoadingState message="Loading post..." />;
  if (!post) return <p className="text-sm text-[#DA3753]">Post not found.</p>;

  return (
    <>
      <Link
        href="/admin/posts"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </Link>
      <AdminPageHeader
        title={post.title}
        actions={
          <>
            <Link
              href={`/admin/posts/${post.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{post.title}</CardTitle>
            <Badge variant="outline">{formatLabel(post.type)}</Badge>
          </div>
          <p className="text-subtle text-sm">
            By {post.author?.full_name ?? `#${post.author_id}`} · {formatDate(post.created_at)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-heading whitespace-pre-wrap">{post.body}</p>
          {post.link_url ? (
            <p>
              <a
                href={post.link_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#0C44B7] hover:underline"
              >
                {post.link_url}
              </a>
            </p>
          ) : null}
          {post.hashtags?.length ? (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)] px-2 py-0.5 text-xs text-heading"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminPostDetailPage() {
  return (
    <AdminShell>
      <PostDetailContent />
    </AdminShell>
  );
}
