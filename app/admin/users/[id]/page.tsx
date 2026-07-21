"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { LoadingState } from "@/app/_components/page-states";
import { Avatar, Badge } from "@/components/ui/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import usersService from "@/services/users";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel } from "@/lib/utils";
import type { User } from "@/types";

function UserDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchUser = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const data = await usersService.getById(id);
      setUser(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function handleToggleStatus() {
    if (!user) return;
    setToggling(true);
    try {
      const updated = await usersService.patchStatus(user.id, {
        is_active: !user.is_active,
      });
      setUser(updated);
      toast.success(updated.is_active ? "User activated" : "User deactivated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!user || !confirm("Delete this user permanently?")) return;
    try {
      await usersService.delete(user.id);
      toast.success("User deleted");
      router.push("/admin/users");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (loading) return <LoadingState message="Loading user..." />;
  if (!user) {
    return <p className="text-sm text-[#DA3753]">User not found.</p>;
  }

  return (
    <>
      <Link
        href="/admin/users"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>
      <AdminPageHeader
        title={user.full_name}
        description={user.email}
        actions={
          <>
            <Link
              href={`/admin/users/${user.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <Button
              variant={user.is_active ? "destructive" : "default"}
              size="sm"
              loading={toggling}
              onClick={handleToggleStatus}
            >
              {user.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar src={user.avatar_url} name={user.full_name} size="lg" />
          <div>
            <CardTitle>{user.full_name}</CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{formatLabel(user.role)}</Badge>
              <Badge variant={user.is_active ? "success" : "danger"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Location</p>
            <p className="text-heading">{user.location ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Phone</p>
            <p className="text-heading">{user.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Education</p>
            <p className="text-heading">
              {user.education_level ? formatLabel(user.education_level) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Joined</p>
            <p className="text-heading">{formatDate(user.created_at)}</p>
          </div>
          {user.bio ? (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-subtle">Bio</p>
              <p className="text-heading whitespace-pre-wrap">{user.bio}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminUserDetailPage() {
  return (
    <AdminShell>
      <UserDetailContent />
    </AdminShell>
  );
}
