"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/app/_components/page-states";
import catalogService from "@/services/catalog";
import { SKILL_LEVELS } from "@/lib/constants";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Skill } from "@/types";

const schema = z.object({
  skill_id: z.string().min(1, "Select a skill"),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

type FormData = z.infer<typeof schema>;

function AddSkillContent() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { level: "beginner" },
  });

  useEffect(() => {
    catalogService
      .listSkills()
      .then(setSkills)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await catalogService.addMySkill({
        skill_id: Number(data.skill_id),
        level: data.level,
      });
      toast.success("Skill added");
      router.push("/my/skills");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-heading">Add skill</h1>
      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Select skill and level</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="skill_id">Skill</Label>
              <Select id="skill_id" {...register("skill_id")}>
                <option value="">Choose skill</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
              {errors.skill_id && <p className="mt-1 text-sm text-[var(--brand-rose)]">{errors.skill_id.message}</p>}
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Select id="level" {...register("level")}>
                {SKILL_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add skill"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AddSkillPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <AddSkillContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
