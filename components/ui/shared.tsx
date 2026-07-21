import { cn, formatLabel, resolveMediaUrl } from "@/lib/utils";
import { getEntityInitials, getInitialAvatarClass } from "@/lib/avatar-utils";
import { STATUS_COLORS } from "@/lib/constants";
import type { ApplicationStatus } from "@/types";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  entityId?: number;
  className?: string;
}

const avatarSizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
};

export function Avatar({ src, name, size = "md", entityId, className }: AvatarProps) {
  const initials = getEntityInitials(name);
  const resolvedSrc = resolveMediaUrl(src);
  const dimension = size === "sm" ? 32 : size === "md" ? 40 : 56;

  if (resolvedSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
        alt={name}
        width={dimension}
        height={dimension}
        className={cn(
          "rounded-full object-cover ring-2 ring-[#0C44B7]/20",
          avatarSizes[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        avatarSizes[size],
        getInitialAvatarClass({ entityId }),
        className,
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-[#0C44B7] text-white",
  secondary: "bg-gradient-to-r from-[#5A299A] to-[#AB2F74] text-white",
  outline:
    "border border-[#0C44B7] bg-transparent text-[#0C44B7] dark:border-[#22d3ee] dark:text-[#22d3ee]",
  success: "bg-gradient-to-r from-[#0C44B7] to-[#22d3ee] text-white",
  warning: "bg-gradient-to-r from-[#F94D32] to-[#fbbf24] text-white",
  danger: "bg-gradient-to-r from-[#DA3753] to-[#AB2F74] text-white",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status as ApplicationStatus;
  const color =
    STATUS_COLORS[normalized as keyof typeof STATUS_COLORS] ?? "#133099";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {formatLabel(status)}
    </span>
  );
}

export default Avatar;
