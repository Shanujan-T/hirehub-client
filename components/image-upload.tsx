"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  className?: string;
  dropzoneTitle?: string;
  dropzoneHint?: string;
  previewAspectClass?: string;
  previewAlt?: string;
}

export function ImageUpload({
  file,
  previewUrl,
  onFileChange,
  className,
  dropzoneTitle = "Add an image",
  dropzoneHint = "JPG, PNG, or WEBP · max 5MB · optional",
  previewAspectClass = "aspect-video w-full object-cover",
  previewAlt = "Image preview",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = (next: File | null) => {
    setError(null);
    if (!next) {
      onFileChange(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(next.type)) {
      setError("Use JPG, PNG, or WEBP only.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("Image must be 5MB or smaller.");
      return;
    }
    onFileChange(next);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-default">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={previewAlt} className={previewAspectClass} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 size-8 bg-black/50 text-white hover:bg-black/70"
            onClick={() => {
              validateAndSet(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="Remove image"
          >
            <X className="size-4" />
          </Button>
          {file && (
            <p className="text-subtle truncate px-3 py-2 text-xs">{file.name}</p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            dragOver
              ? "border-[var(--brand-blue)] bg-[color-mix(in_srgb,var(--brand-blue)_8%,transparent)]"
              : "border-default",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            validateAndSet(e.dataTransfer.files?.[0] ?? null);
          }}
        >
          <ImagePlus className="text-subtle mb-3 h-8 w-8" />
          <p className="text-sm font-medium text-heading">{dropzoneTitle}</p>
          <p className="text-subtle mt-1 text-xs">{dropzoneHint}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => validateAndSet(e.target.files?.[0] ?? null)}
      />

      {error && (
        <p className="text-xs text-[#DA3753]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ImageUpload;
