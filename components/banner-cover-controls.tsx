"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface BannerCoverControlsProps {
  hasCover: boolean;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  onPreviewChange?: (previewUrl: string | null) => void;
  className?: string;
}

/**
 * Owner controls for wide banner/cover photos (camera overlay + confirm preview).
 */
export function BannerCoverControls({
  hasCover,
  onUpload,
  onRemove,
  onPreviewChange,
  className,
}: BannerCoverControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    onPreviewChange?.(pendingPreview);
  }, [pendingPreview, onPreviewChange]);

  const clearPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    onPreviewChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handlePick = (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Use JPG, PNG, or WEBP only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPreview(url);
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      await onUpload(pendingFile);
      toast.success("Cover photo updated");
      clearPending();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setRemoving(true);
    try {
      await onRemove();
      toast.success("Cover photo removed");
      clearPending();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
      />

      {pendingFile ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="onDark"
            loading={uploading}
            onClick={confirmUpload}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Confirm cover
          </Button>
          <Button
            type="button"
            size="sm"
            variant="onDarkOutline"
            disabled={uploading}
            onClick={clearPending}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            size="sm"
            variant="onDarkOutline"
            onClick={() => inputRef.current?.click()}
            className="h-8 gap-1.5 px-3 text-xs"
            aria-label="Change cover photo"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            {hasCover ? "Change cover" : "Add cover photo"}
          </Button>
          {hasCover && onRemove ? (
            <Button
              type="button"
              size="sm"
              variant="onDarkOutline"
              loading={removing}
              onClick={handleRemove}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              Remove cover
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

export default BannerCoverControls;
