"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full";
  showName?: boolean;
  /** Use dark-background logo regardless of site theme (e.g. auth hero panel). */
  forceDarkIcon?: boolean;
  wordmarkClassName?: string;
}

const sizeMap = {
  sm: 40,
  md: 48,
  lg: 64,
};

const nameSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const fullSizeMap = {
  sm: { width: 140, height: 48 },
  md: { width: 180, height: 62 },
  lg: { width: 240, height: 82 },
};

export function BrandLogo({
  className,
  href = "/",
  size = "md",
  variant = "icon",
  showName = true,
  forceDarkIcon = false,
  wordmarkClassName,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const iconSrc =
    forceDarkIcon || isDark ? "/hirehub-logo-dark.png" : "/hirehub-logo-light.png";
  const fullSrc = "/hirehub-logo-full.png";

  const logoImage =
    variant === "full" ? (
      <Image
        src={fullSrc}
        alt="HireHub"
        width={fullSizeMap[size].width}
        height={fullSizeMap[size].height}
        className={cn("h-auto w-auto object-contain object-center", className)}
        priority
      />
    ) : (
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden"
        style={{ width: sizeMap[size], height: sizeMap[size] }}
      >
        <Image
          src={iconSrc}
          alt=""
          width={sizeMap[size]}
          height={sizeMap[size]}
          className={cn("h-full w-full object-contain object-center", className)}
          priority
          aria-hidden
        />
      </span>
    );

  const logo = (
    <>
      {logoImage}
      {variant === "icon" && showName ? (
        <span
          className={cn(
            "font-display font-extrabold tracking-tight brand-gradient-text",
            nameSizeMap[size],
            wordmarkClassName,
          )}
        >
          HireHub
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <span className="inline-flex shrink-0 items-center gap-2">{logo}</span>;
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]"
      aria-label="HireHub home"
    >
      {logo}
    </Link>
  );
}
