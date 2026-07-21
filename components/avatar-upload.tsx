"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { EntityAvatar } from "@/components/entity-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface AvatarUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  shape?: "circle" | "rounded-square";
  label?: string;
  name: string;
  entityId?: number;
  variant?: "default" | "company" | "community";
  industry?: string | null;
  communityType?: string | null;
  className?: string;
}

export function AvatarUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  shape = "circle",
  label = "Photo",
  name,
  entityId,
  variant = "default",
  industry,
  communityType,
  className,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCircle = shape === "circle";
  const previewClass = cn(
    "size-24 text-2xl",
    isCircle ? "rounded-full" : "rounded-2xl",
  );

  const validateAndUpload = async (file: File | null) => {
    setError(null);
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use JPG, PNG, or WEBP only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
      if (inputRef.current) inputRef.current.value = "";
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove photo.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-heading text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap items-center gap-4">
        <EntityAvatar
          name={name}
          imageUrl={currentImageUrl}
          entityId={entityId}
          industry={industry}
          communityType={communityType}
          variant={variant}
          className={previewClass}
        />

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {currentImageUrl ? "Replace photo" : "Upload photo"}
          </Button>
          {currentImageUrl && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={removing}
              onClick={handleRemove}
              className="text-subtle"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <p className="text-subtle text-xs">JPG, PNG, or WEBP · max 5MB</p>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => validateAndUpload(e.target.files?.[0] ?? null)}
      />

      {error && (
        <p className="text-xs text-[#DA3753]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default AvatarUpload;
