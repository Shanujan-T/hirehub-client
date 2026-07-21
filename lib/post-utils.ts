import type { PostType, UserRole } from "@/types";

export const POST_TYPE_BADGE_CLASSES: Record<string, string> = {
  discussion: "bg-[#0C44B7] text-white",
  job_share: "bg-emerald-600 text-white",
  job_opportunity: "bg-emerald-600 text-white",
  referral_request: "bg-emerald-600 text-white",
  hiring_announcement: "bg-emerald-600 text-white",
  internship: "bg-emerald-600 text-white",
  success_story: "bg-amber-500 text-white",
  guidance: "bg-[#5A299A] text-white",
  career_advice: "bg-[#5A299A] text-white",
  learning_resource: "bg-[#5A299A] text-white",
  interview_experience: "bg-[#0C44B7]/80 text-white",
  event: "bg-slate-600 text-white",
  workshop: "bg-slate-600 text-white",
  announcement: "bg-slate-600 text-white",
};

export const POST_TYPE_FILTER_ACTIVE: Record<string, string> = {
  discussion: "bg-[#0C44B7] text-white border-[#0C44B7]",
  job_share: "bg-emerald-600 text-white border-emerald-600",
  success_story: "bg-amber-500 text-white border-amber-500",
  guidance: "bg-[#5A299A] text-white border-[#5A299A]",
};

export const POST_TYPE_FILTER_IDLE: Record<string, string> = {
  discussion: "border-[#0C44B7]/30 text-[#0C44B7] hover:bg-[#0C44B7]/10",
  job_share: "border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
  success_story: "border-amber-500/30 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
  guidance: "border-[#5A299A]/30 text-[#5A299A] hover:bg-[#5A299A]/10",
};

export function getPostTypeBadgeClass(type: PostType | string): string {
  return POST_TYPE_BADGE_CLASSES[type] ?? "bg-slate-500 text-white";
}

export function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case "employer":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "admin":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300";
  }
}
