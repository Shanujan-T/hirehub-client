"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  /** Fallback destination when there is no same-origin history to go back to. */
  href: string;
  label: string;
  /** Use on dark/gradient hero banners for contrast. */
  variant?: "default" | "onDark";
  className?: string;
}

/**
 * In-page back control: prefers `router.back()` when the previous page is
 * same-origin (preserves list filters), otherwise navigates to `href`.
 */
export function BackLink({
  href,
  label,
  variant = "default",
  className,
}: BackLinkProps) {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    const referrer = document.referrer;
    const sameOrigin =
      Boolean(referrer) && referrer.startsWith(window.location.origin);
    if (sameOrigin && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 text-sm transition-colors",
        variant === "onDark"
          ? "text-[#FDFDFD]/80 hover:text-[#FDFDFD]"
          : "text-subtle hover:text-[var(--brand-blue)]",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

export default BackLink;
