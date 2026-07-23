"use client";

import { cn, resolveMediaUrl } from "@/lib/utils";
import {
  getEntityInitials,
  getInitialAvatarClass,
  type AvatarColorOptions,
} from "@/lib/avatar-utils";

interface EntityAvatarProps extends AvatarColorOptions {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "size-11 text-sm",
  md: "size-12 text-base",
};

export function EntityAvatar({
  name,
  imageUrl,
  entityId,
  communityType,
  industry,
  variant = "default",
  size = "md",
  className,
}: EntityAvatarProps) {
  const src = resolveMediaUrl(imageUrl);

  if (src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border border-default",
          sizeClasses[size],
          className,
        )}
      >
        {/* Native img: uploads are stored as originals; Next/Image recompresses at low sizes/quality. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-semibold",
        sizeClasses[size],
        getInitialAvatarClass({ entityId, communityType, industry, variant }),
        className,
      )}
      aria-label={name}
    >
      {getEntityInitials(name)}
    </div>
  );
}

export default EntityAvatar;
