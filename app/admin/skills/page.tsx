"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  AdminShell,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/app/admin/_components/admin-shell";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { ExportButton } from "@/components/export-button";
import { ImportDialog } from "@/components/import-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Skill } from "@/types";

function SkillsListContent() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogService.listSkills();
      setSkills(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this skill?")) return;
    setDeletingId(id);
    try {
      await catalogService.deleteSkill(id);
      toast.success("Skill deleted");
      fetchSkills();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Skills Catalog"
        description="Manage skills used across jobs and profiles"
        actions={
          <>
            <ExportButton label="Export CSV" onExport={() => catalogService.exportSkills()} />
            <ImportDialog
              title="Import Skills"
              description="Upload a CSV file to bulk-import skills."
              onImport={(file) => catalogService.importSkills(file)}
              onSuccess={() => fetchSkills()}
            />
            <Link href="/admin/skills/new" className={buttonVariants({ size: "sm" })}>
              <Plus className="h-4 w-4" /> Add Skill
            </Link>
          </>
        }
      />

      {loading ? (
        <LoadingState message="Loading skills..." />
      ) : skills.length === 0 ? (
        <EmptyState icon={Sparkles} title="No skills found" />
      ) : (
        <AdminTable headers={["Name", "Category", "Created", ""]}>
          {skills.map((skill) => (
            <AdminTableRow key={skill.id}>
              <AdminTableCell className="font-medium">{skill.name}</AdminTableCell>
              <AdminTableCell>{skill.category ?? "—"}</AdminTableCell>
              <AdminTableCell>{formatDate(skill.created_at)}</AdminTableCell>
              <AdminTableCell>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/skills/${skill.id}/edit`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Edit
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    loading={deletingId === skill.id}
                    onClick={() => handleDelete(skill.id)}
                  >
                    Delete
                  </Button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </>
  );
}

export default function AdminSkillsPage() {
  return (
    <AdminShell>
      <SkillsListContent />
    </AdminShell>
  );
}
