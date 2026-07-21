"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";
import type { UserSkill } from "@/types";

function MySkillsContent() {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    catalogService
      .listMySkills()
      .then(setSkills)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: number) => {
    try {
      await catalogService.deleteMySkill(id);
      toast.success("Skill removed");
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState message="Loading skills..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-heading">My Skills</h1>
          <p className="text-subtle mt-1">Skills power your job recommendations</p>
        </div>
        <Link href="/my/skills/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add skill
          </Button>
        </Link>
      </div>
      {skills.length === 0 ? (
        <EmptyState title="No skills yet" description="Add skills to get better job matches." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((item) => (
            <Card key={item.id} className="border-default bg-surface-card">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-heading">
                    {item.skill?.name ?? "Skill"}
                    {item.verified ? (
                      <BadgeCheck className="h-4 w-4 text-[var(--brand-blue)]" aria-label="Verified by employer" />
                    ) : null}
                  </p>
                  <p className="text-subtle text-sm capitalize">{item.level}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                  <Trash2 className="h-4 w-4 text-[var(--brand-rose)]" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MySkillsPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <MySkillsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
