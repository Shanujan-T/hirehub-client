"use client";

import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/shared";
import { cn, formatLabel } from "@/lib/utils";
import type { UserSkill } from "@/types";

interface UserSkillBadgeProps {
  userSkill: UserSkill;
  variant?: "outline" | "secondary" | "success" | "warning" | "danger";
  showLevel?: boolean;
  className?: string;
}

export function UserSkillBadge({
  userSkill,
  variant = "outline",
  showLevel = true,
  className,
}: UserSkillBadgeProps) {
  return (
    <Badge variant={variant} className={cn("inline-flex items-center gap-1", className)}>
      {userSkill.skill?.name ?? "Skill"}
      {showLevel && userSkill.level ? ` · ${formatLabel(userSkill.level)}` : null}
      {userSkill.verified ? (
        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[var(--brand-blue)]" aria-label="Verified by employer" />
      ) : null}
    </Badge>
  );
}

export default UserSkillBadge;
