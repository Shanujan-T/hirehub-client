"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { FormGroup } from "@/app/_components/page-states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import authService from "@/services/auth";
import { getApiErrorMessage } from "@/lib/api-client";
import { EDUCATION_LEVELS, USER_ROLES } from "@/lib/constants";
import { formatLabel } from "@/lib/utils";
import type { UserRole } from "@/types";

const schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(USER_ROLES),
  location: z.string().optional(),
  education_level: z.enum(EDUCATION_LEVELS).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function NewUserForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "seeker", education_level: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const { user } = await authService.register({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role as UserRole,
        location: data.location || undefined,
      });
      toast.success("User created successfully");
      router.push(`/admin/users/${user.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Link
        href="/admin/users"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>
      <AdminPageHeader title="Create User" description="Register a new platform account" />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Full name">
              <Input {...register("full_name")} error={errors.full_name?.message} />
            </FormGroup>
            <FormGroup label="Email">
              <Input type="email" {...register("email")} error={errors.email?.message} />
            </FormGroup>
            <FormGroup label="Password">
              <PasswordInput {...register("password")} error={errors.password?.message} />
            </FormGroup>
            <FormGroup label="Role">
              <Select {...register("role")} error={errors.role?.message}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatLabel(role)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Location">
              <Input {...register("location")} placeholder="Optional" />
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
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                Create User
              </Button>
              <Link href="/admin/users" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminNewUserPage() {
  return (
    <AdminShell>
      <NewUserForm />
    </AdminShell>
  );
}
