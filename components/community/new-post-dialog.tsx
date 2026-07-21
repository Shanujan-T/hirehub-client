"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormGroup } from "@/app/_components/page-states";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PostImageDropzone } from "@/components/post-image-dropzone";
import postsService from "@/services/posts";
import { getApiErrorMessage } from "@/lib/api-client";
import { FEED_POST_TYPES } from "@/lib/constants";
import { POST_TYPE_FILTER_ACTIVE, POST_TYPE_FILTER_IDLE } from "@/lib/post-utils";
import { cn, formatLabel } from "@/lib/utils";
import type { PostType } from "@/types";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  body: z.string().min(10, "Body must be at least 10 characters"),
  type: z.enum(FEED_POST_TYPES),
  link_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

interface NewPostDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewPostDialog({ open, onClose, onCreated }: NewPostDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { type: "discussion", link_url: "" },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleClose = () => {
    reset({ type: "discussion", link_url: "" });
    setImageFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const onSubmit = async (data: CreatePostForm) => {
    setSubmitting(true);
    try {
      const post = await postsService.create({
        title: data.title,
        body: data.body,
        type: data.type as PostType,
        link_url: data.link_url || undefined,
        image: imageFile,
      });
      toast.success("Post created successfully!");
      handleClose();
      onCreated?.();
      router.push(`/community/${post.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create a Post" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGroup label="Title">
          <Input
            {...register("title")}
            placeholder="What's on your mind?"
            error={errors.title?.message}
          />
        </FormGroup>

        <FormGroup label="Type">
          <div className="flex flex-wrap gap-2">
            {FEED_POST_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("type", type, { shouldValidate: true })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedType === type
                    ? POST_TYPE_FILTER_ACTIVE[type]
                    : POST_TYPE_FILTER_IDLE[type],
                )}
              >
                {formatLabel(type)}
              </button>
            ))}
          </div>
          {errors.type?.message && (
            <p className="mt-1 text-xs text-[#DA3753]" role="alert">
              {errors.type.message}
            </p>
          )}
        </FormGroup>

        <FormGroup label="Content">
          <Textarea
            {...register("body")}
            rows={6}
            placeholder="Share your experience, advice, or question..."
            error={errors.body?.message}
          />
        </FormGroup>

        <FormGroup label="Cover image (optional)">
          <PostImageDropzone
            file={imageFile}
            previewUrl={previewUrl}
            onFileChange={setImageFile}
          />
        </FormGroup>

        <FormGroup label="Link (optional)">
          <Input {...register("link_url")} placeholder="https://..." error={errors.link_url?.message} />
        </FormGroup>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Publish Post
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NewPostDialog;
