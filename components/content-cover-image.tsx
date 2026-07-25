"use client";

import { cn } from "@/lib/utils";

interface ContentCoverImageProps {
  src: string;
  alt?: string;
  /** Max height class; feed default 320px, detail pages may use taller. */
  maxHeightClass?: string;
  className?: string;
  imgClassName?: string;
  roundedClassName?: string;
}

/**
 * Flexible content/cover image: preserves original aspect ratio (no crop),
 * capped by max-height so tall uploads cannot dominate the layout.
 */
export function ContentCoverImage({
  src,
  alt = "",
  maxHeightClass = "max-h-[320px]",
  className,
  imgClassName,
  roundedClassName = "rounded-xl",
}: ContentCoverImageProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden bg-gray-50 dark:bg-gray-900",
        roundedClassName,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "mx-auto block h-auto w-full object-contain",
          maxHeightClass,
          imgClassName,
        )}
      />
    </div>
  );
}

export default ContentCoverImage;
