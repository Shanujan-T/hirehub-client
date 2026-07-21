/** Brand-only palette — no red (reserved for errors/destructive actions). */
export const BRAND_AVATAR_COLORS = [
  "bg-blue-600 text-white",
  "bg-purple-600 text-white",
  "bg-pink-600 text-white",
  "bg-orange-500 text-white",
  "bg-indigo-600 text-white",
  "bg-cyan-600 text-white",
] as const;

const COMMUNITY_TYPE_COLORS: Record<string, string> = {
  interest: "bg-purple-600 text-white",
  industry: "bg-blue-600 text-white",
  location: "bg-cyan-600 text-white",
  university: "bg-indigo-600 text-white",
  profession: "bg-pink-600 text-white",
  organization: "bg-orange-500 text-white",
};

const INDUSTRY_COLOR_RULES: Array<{ pattern: RegExp; color: string }> = [
  { pattern: /tech|software|it|engineering|digital/i, color: "bg-blue-600 text-white" },
  { pattern: /retail|commerce|consumer|hospitality/i, color: "bg-orange-500 text-white" },
  { pattern: /health|medical|pharma|care/i, color: "bg-indigo-600 text-white" },
  { pattern: /finance|bank|insurance|fintech|accounting/i, color: "bg-purple-600 text-white" },
  { pattern: /education|university|school|learning|academ/i, color: "bg-indigo-600 text-white" },
  { pattern: /media|marketing|creative|design|advertis/i, color: "bg-pink-600 text-white" },
  { pattern: /human resources|recruit|staffing|\bhr\b/i, color: "bg-cyan-600 text-white" },
  { pattern: /manufactur|logistics|supply|transport/i, color: "bg-orange-500 text-white" },
];

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAvatarColorById(id: number): string {
  return BRAND_AVATAR_COLORS[id % BRAND_AVATAR_COLORS.length];
}

export function getCommunityAvatarClass(
  communityType?: string | null,
  entityId?: number,
): string {
  if (communityType && COMMUNITY_TYPE_COLORS[communityType]) {
    return COMMUNITY_TYPE_COLORS[communityType];
  }
  if (entityId != null) {
    return getAvatarColorById(entityId);
  }
  return BRAND_AVATAR_COLORS[0];
}

export function getCompanyAvatarClass(
  industry?: string | null,
  entityId?: number,
): string {
  if (industry) {
    for (const rule of INDUSTRY_COLOR_RULES) {
      if (rule.pattern.test(industry)) {
        return rule.color;
      }
    }
    return BRAND_AVATAR_COLORS[hashString(industry.toLowerCase()) % BRAND_AVATAR_COLORS.length];
  }
  if (entityId != null) {
    return getAvatarColorById(entityId);
  }
  return BRAND_AVATAR_COLORS[0];
}

export interface AvatarColorOptions {
  entityId?: number;
  communityType?: string | null;
  industry?: string | null;
  variant?: "community" | "company" | "default";
}

export function getInitialAvatarClass(options: AvatarColorOptions = {}): string {
  const { entityId, communityType, industry, variant = "default" } = options;

  if (variant === "community") {
    return getCommunityAvatarClass(communityType, entityId);
  }
  if (variant === "company") {
    return getCompanyAvatarClass(industry, entityId);
  }
  if (entityId != null) {
    return getAvatarColorById(entityId);
  }
  return BRAND_AVATAR_COLORS[0];
}

export function getEntityInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
}
