import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "@/lib/constants";
import type { UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "seeker":
      return "/dashboard";
    case "employer":
      return "/employer/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

/** Role-specific "My Communities" portal route (shared view, different sidebar context). */
export function getMyCommunitiesPath(role: UserRole | undefined): string {
  if (role === "employer") return "/employer/communities";
  return "/my-communities";
}

export function formatDate(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "—";
  const date = parseApiDate(value);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Parse API timestamps. Naive ISO datetimes (no Z/offset) are treated as UTC,
 * matching backend storage. Date-only strings stay calendar dates.
 */
export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Already timezone-aware
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Date-only YYYY-MM-DD — keep as local calendar date
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Naive datetime → UTC
  const asUtc = /T/.test(trimmed) ? `${trimmed}Z` : trimmed;
  const d = new Date(asUtc);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Short relative time for activity feeds, e.g. "2 days ago". */
export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = parseApiDate(value);
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return formatDate(value);
}

/** Compact clock time for read receipts, e.g. "2:45 PM". */
export function formatClockTime(value: string | null | undefined): string {
  const date = parseApiDate(value);
  if (!date) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = "USD",
): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }
  if (min != null) return `From ${formatter.format(min)}`;
  if (max != null) return `Up to ${formatter.format(max)}`;
  return "Not disclosed";
}

export function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) {
    return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
  }
  return url;
}

/** Truncate text to a max character length with an ellipsis when exceeded. */
export function truncateText(
  value: string | null | undefined,
  maxLength = 70,
): string {
  const text = (value ?? "").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

