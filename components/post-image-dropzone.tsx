"use client";

import { ImageUpload } from "@/components/image-upload";

interface PostImageDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  className?: string;
}

export function PostImageDropzone(props: PostImageDropzoneProps) {
  return (
    <div className={props.className}>
      <ImageUpload
        file={props.file}
        previewUrl={props.previewUrl}
        onFileChange={props.onFileChange}
        dropzoneTitle="Add a cover image"
        dropzoneHint="JPG, PNG, or WEBP · max 5MB · optional"
      />
      <p className="text-subtle mt-2 text-xs leading-relaxed">
        Add a photo relevant to your post (optional) — screenshots, certificates,
        or real photos work best.
      </p>
    </div>
  );
}

export default PostImageDropzone;
