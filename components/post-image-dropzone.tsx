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
    <ImageUpload
      {...props}
      dropzoneTitle="Add a cover image"
      dropzoneHint="JPG, PNG, or WEBP · max 5MB · optional"
    />
  );
}

export default PostImageDropzone;
