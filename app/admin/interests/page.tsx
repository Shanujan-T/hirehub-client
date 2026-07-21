"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  AdminShell,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/app/admin/_components/admin-shell";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { Button, buttonVariants } from "@/components/ui/button";
import catalogService from "@/services/catalog";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Interest } from "@/types";

function InterestsListContent() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchInterests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogService.listInterests();
      setInterests(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setInterests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this interest?")) return;
    setDeletingId(id);
    try {
      await catalogService.deleteInterest(id);
      toast.success("Interest deleted");
      fetchInterests();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Interests Catalog"
        description="Manage user interest tags"
        actions={
          <Link href="/admin/interests/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4" /> Add Interest
          </Link>
        }
      />

      {loading ? (
        <LoadingState message="Loading interests..." />
      ) : interests.length === 0 ? (
        <EmptyState icon={Heart} title="No interests found" />
      ) : (
        <AdminTable headers={["Name", "Category", "Created", ""]}>
          {interests.map((interest) => (
            <AdminTableRow key={interest.id}>
              <AdminTableCell className="font-medium">{interest.name}</AdminTableCell>
              <AdminTableCell>{interest.category ?? "—"}</AdminTableCell>
              <AdminTableCell>{formatDate(interest.created_at)}</AdminTableCell>
              <AdminTableCell>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/interests/${interest.id}/edit`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Edit
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    loading={deletingId === interest.id}
                    onClick={() => handleDelete(interest.id)}
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

export default function AdminInterestsPage() {
  return (
    <AdminShell>
      <InterestsListContent />
    </AdminShell>
  );
}
