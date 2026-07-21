"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/shared";
import usersService from "@/services/users";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel } from "@/lib/utils";
import type { User } from "@/types";

function UsersListContent() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersService.list();
      setUsers(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Manage platform accounts and roles"
        actions={
          <>
            <ExportButton label="Export CSV" onExport={() => usersService.exportCsv()} />
            <ImportDialog
              title="Import Users"
              description="Upload a CSV file to bulk-import users."
              onImport={(file) => usersService.importCsv(file)}
              onSuccess={() => fetchUsers()}
            />
            <Link href="/admin/users/new" className={buttonVariants({ size: "sm" })}>
              <Plus className="h-4 w-4" /> Add User
            </Link>
          </>
        }
      />

      {loading ? (
        <LoadingState message="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <AdminTable headers={["Name", "Email", "Role", "Status", "Joined", ""]}>
          {users.map((user) => (
            <AdminTableRow
              key={user.id}
              onClick={() => router.push(`/admin/users/${user.id}`)}
            >
              <AdminTableCell className="font-medium">{user.full_name}</AdminTableCell>
              <AdminTableCell>{user.email}</AdminTableCell>
              <AdminTableCell>
                <Badge variant="outline">{formatLabel(user.role)}</Badge>
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={user.is_active ? "success" : "danger"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>{formatDate(user.created_at)}</AdminTableCell>
              <AdminTableCell>
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UsersListContent />
    </AdminShell>
  );
}
