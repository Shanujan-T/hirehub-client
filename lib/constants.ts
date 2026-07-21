/** API origin for axios. Empty string = same-origin via Next.js rewrites (recommended in dev). */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export const TOKEN_KEY = "hirehub_token";
export const USER_KEY = "hirehub_user";
export const THEME_KEY = "hirehub_theme";

/** Brand palette */
export const BRAND = {
  navy900: "#041B5F",
  navy700: "#133099",
  blue600: "#0C44B7",
  purple600: "#5A299A",
  magenta500: "#AB2F74",
  rose500: "#DA3753",
  orange500: "#F94D32",
  white: "#FDFDFD",
} as const;

export const JOB_TYPES = [
  "full_time",
  "part_time",
  "internship",
  "contract",
] as const;

export const EXPERIENCE_LEVELS = [
  "entry",
  "junior",
  "mid",
  "senior",
] as const;

export const APPLICATION_STATUSES = [
  "pending",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export const STATUS_COLORS: Record<
  (typeof APPLICATION_STATUSES)[number],
  string
> = {
  pending: BRAND.blue600,
  shortlisted: BRAND.purple600,
  accepted: "#22d3ee",
  rejected: BRAND.rose500,
  withdrawn: BRAND.magenta500,
};

export const USER_ROLES = ["seeker", "employer", "admin"] as const;

export const EDUCATION_LEVELS = [
  "school",
  "diploma",
  "bachelors",
  "masters",
  "other",
] as const;

export const JOB_STATUSES = ["open", "closed", "filled"] as const;

export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export const POST_TYPES = [
  "discussion",
  "job_opportunity",
  "internship",
  "career_advice",
  "interview_experience",
  "success_story",
  "hiring_announcement",
  "referral_request",
  "learning_resource",
  "event",
  "workshop",
  "job_share",
  "guidance",
  "announcement",
] as const;

/** Primary feed filter types (aligned with main spec) */
export const FEED_POST_TYPES = [
  "discussion",
  "job_share",
  "success_story",
  "guidance",
] as const;

export const MEDIA_TYPES = ["image", "pdf", "video"] as const;

export const REACTION_TYPES = [
  "like",
  "love",
  "celebrate",
  "insightful",
  "support",
] as const;

export const REPORT_TARGET_TYPES = [
  "post",
  "comment",
  "job",
  "user",
  "community",
  "referral",
] as const;

export const REPORT_STATUSES = [
  "open",
  "reviewed",
  "dismissed",
  "actioned",
] as const;

export const MENTORSHIP_STATUSES = [
  "requested",
  "active",
  "ended",
  "declined",
] as const;

export const REFERRAL_STATUSES = [
  "pending",
  "submitted",
  "interviewing",
  "hired",
  "declined",
] as const;

export const COMMUNITY_TYPES = [
  "organization",
  "university",
  "profession",
  "industry",
  "location",
  "interest",
] as const;

export const COMMUNITY_ROLES = ["admin", "moderator", "member"] as const;

export const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

/** Landing / public page theme-aware surfaces (Tailwind dark: pattern) */
export const HERO_LANDING_BG =
  "bg-gradient-to-br from-indigo-50 via-purple-50 to-orange-50 transition-colors duration-300 dark:from-[#0a0e2a] dark:via-[#1a0b2e] dark:to-[#2e1509]";

export const PAGE_HEADER_BAND =
  "bg-gradient-to-br from-indigo-50 via-purple-50 to-orange-50 transition-colors duration-300 dark:from-[#0c0c14] dark:via-[#1a0b2e] dark:to-[#2e1509]";

export const SECTION_BRAND_TINT =
  "bg-gradient-to-b from-indigo-50/70 via-purple-50/50 to-orange-50/40 transition-colors duration-300 dark:from-transparent dark:via-transparent dark:to-transparent";

export const BTN_BRAND_GRADIENT =
  "border-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700";

export const BTN_CYAN_OUTLINE =
  "border-2 border-cyan-500 bg-transparent text-cyan-600 hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-950/60";
