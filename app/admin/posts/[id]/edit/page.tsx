"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { FormGroup, LoadingState } from "@/app/_components/page-states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/card";
import postsService from "@/services/posts";
import { getApiErrorMessage } from "@/lib/api-client";
import { POST_TYPES } from "@/lib/constants";
import { formatLabel } from "@/lib/utils";
import type { PostType } from "@/types";

const schema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  type: z.enum(POST_TYPES),
  link_url: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function EditPostForm() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const fetchPost = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const post = await postsService.getById(id);
      reset({
        title: post.title,
        body: post.body,
        type: post.type,
        link_url: post.link_url ?? "",
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await postsService.update(id, {
        title: data.title,
        body: data.body,
        type: data.type as PostType,
        link_url: data.link_url || undefined,
      });
      toast.success("Post updated");
      router.push(`/admin/posts/${id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading post..." />;

  return (
    <>
      <Link
        href={`/admin/posts/${id}`}
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to post
      </Link>
      <AdminPageHeader title="Edit Post" />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Title">
              <Input {...register("title")} error={errors.title?.message} />
            </FormGroup>
            <FormGroup label="Type">
              <Select {...register("type")}>
                {POST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Body">
              <Textarea {...register("body")} rows={8} error={errors.body?.message} />
            </FormGroup>
            <FormGroup label="Link URL">
              <Input {...register("link_url")} error={errors.link_url?.message} />
            </FormGroup>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
              <Link href={`/admin/posts/${id}`} className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminEditPostPage() {
  return (
    <AdminShell>
      <EditPostForm />
    </AdminShell>
  );
}
