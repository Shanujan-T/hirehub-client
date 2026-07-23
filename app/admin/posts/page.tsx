"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  AdminShell,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/app/admin/_components/admin-shell";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { Badge } from "@/components/ui/shared";
import { buttonVariants } from "@/components/ui/button";
import postsService from "@/services/posts";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel } from "@/lib/utils";
import type { Post } from "@/types";

function PostsListContent() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postsService.list();
      setPosts(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      <AdminPageHeader
        title="Posts"
        description="Moderate feed and group posts"
      />

      {loading ? (
        <LoadingState message="Loading posts..." />
      ) : posts.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No posts found" />
      ) : (
        <AdminTable headers={["Title", "Author", "Type", "Posted", ""]}>
          {posts.map((post) => (
            <AdminTableRow
              key={post.id}
              onClick={() => router.push(`/admin/posts/${post.id}`)}
            >
              <AdminTableCell className="max-w-xs truncate font-medium">
                {post.title}
              </AdminTableCell>
              <AdminTableCell>{post.author?.full_name ?? `#${post.author_id}`}</AdminTableCell>
              <AdminTableCell>
                <Badge variant="outline">{formatLabel(post.type)}</Badge>
              </AdminTableCell>
              <AdminTableCell>{formatDate(post.created_at)}</AdminTableCell>
              <AdminTableCell>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </>
  );
}

export default function AdminPostsPage() {
  return (
    <AdminShell>
      <PostsListContent />
    </AdminShell>
  );
}
