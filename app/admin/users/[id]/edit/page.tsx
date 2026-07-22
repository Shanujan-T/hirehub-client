"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { FormGroup, LoadingState } from "@/app/_components/page-states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Textarea } from "@/components/ui/card";
import usersService from "@/services/users";
import { getApiErrorMessage } from "@/lib/api-client";
import { EDUCATION_LEVELS, USER_ROLES } from "@/lib/constants";
import { formatLabel } from "@/lib/utils";
import type { User, UserRole } from "@/types";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
  location: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  education_level: z.enum(EDUCATION_LEVELS).optional().or(z.literal("")),
  password: z.string().min(8).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function EditUserForm() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const fetchUser = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const user = await usersService.getById(id);
      reset({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        location: user.location ?? "",
        phone: user.phone ?? "",
        bio: user.bio ?? "",
        education_level: user.education_level ?? "",
        password: "",
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await usersService.update(id, {
        full_name: data.full_name,
        email: data.email,
        role: data.role as UserRole,
        location: data.location || null,
        phone: data.phone || null,
        bio: data.bio || null,
        education_level: data.education_level || null,
        ...(data.password ? { password: data.password } : {}),
      });
      toast.success("User updated");
      router.push(`/admin/users/${id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading user..." />;

  return (
    <>
      <Link
        href={`/admin/users/${id}`}
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to user
      </Link>
      <AdminPageHeader title="Edit User" />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Full name">
              <Input {...register("full_name")} error={errors.full_name?.message} />
            </FormGroup>
            <FormGroup label="Email">
              <Input type="email" {...register("email")} error={errors.email?.message} />
            </FormGroup>
            <FormGroup label="Role">
              <Select {...register("role")}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatLabel(role)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Location">
              <Input {...register("location")} />
            </FormGroup>
            <FormGroup label="Phone">
              <Input {...register("phone")} />
            </FormGroup>
            <FormGroup label="Education level">
              <Select {...register("education_level")}>
                <option value="">—</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {formatLabel(level)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Bio">
              <Textarea {...register("bio")} rows={4} />
            </FormGroup>
            <FormGroup label="New password (optional)">
              <PasswordInput {...register("password")} error={errors.password?.message} />
            </FormGroup>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
              <Link href={`/admin/users/${id}`} className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminEditUserPage() {
  return (
    <AdminShell>
      <EditUserForm />
    </AdminShell>
  );
}
