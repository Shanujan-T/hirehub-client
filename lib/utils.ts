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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
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
