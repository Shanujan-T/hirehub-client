"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentCoverImageProps {
  src: string;
  alt?: string;
  /** Max height class; feed default 320px, detail pages may use taller. */
  maxHeightClass?: string;
  className?: string;
  imgClassName?: string;
  roundedClassName?: string;
  /**
   * When the image fails to load: "hide" removes the block entirely (default);
   * "icon" shows a neutral placeholder icon instead of a solid color box.
   */
  onBroken?: "hide" | "icon";
}

/**
 * Flexible content/cover image: preserves original aspect ratio (no crop),
 * capped by max-height so tall uploads cannot dominate the layout.
 * Broken URLs hide or show an icon — never an unstyled solid color block.
 */
export function ContentCoverImage({
  src,
  alt = "",
  maxHeightClass = "max-h-[320px]",
  className,
  imgClassName,
  roundedClassName = "rounded-xl",
  onBroken = "hide",
}: ContentCoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed && onBroken === "hide") {
    return null;
  }

  if (failed && onBroken === "icon") {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center bg-gray-50 py-10 dark:bg-gray-900",
          roundedClassName,
          className,
        )}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <ImageOff
          className="size-8 text-gray-400 dark:text-gray-500"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900",
        roundedClassName,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={cn(
          "mx-auto block h-auto w-auto max-w-full object-contain",
          maxHeightClass,
          imgClassName,
        )}
      />
    </div>
  );
}

export default ContentCoverImage;
