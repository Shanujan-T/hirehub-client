"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { FormGroup, LoadingState } from "@/app/_components/page-states";
import { AvatarUpload } from "@/components/avatar-upload";
import { Avatar } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Textarea } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import authService from "@/services/auth";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel } from "@/lib/utils";

const schema = z.object({
  full_name: z.string().min(2),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function ProfileContent() {
  const { user, refreshProfile, updateProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        bio: user.bio ?? "",
        location: user.location ?? "",
        phone: user.phone ?? "",
        password: "",
      });
    }
  }, [user, reset]);

  if (!user) return <LoadingState message="Loading profile..." />;

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await authService.updateProfile({
        full_name: data.full_name,
        bio: data.bio || undefined,
        location: data.location || undefined,
        phone: data.phone || undefined,
        ...(data.password ? { password: data.password } : {}),
      });
      await refreshProfile?.();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Admin Profile"
        description="Manage your administrator account"
      />

      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar src={user.avatar_url} name={user.full_name} size="lg" entityId={user.id} />
          <div>
            <CardTitle>{user.full_name}</CardTitle>
            <p className="text-subtle text-sm">{user.email}</p>
            <p className="text-subtle mt-1 text-xs">
              {formatLabel(user.role)} · Joined {formatDate(user.created_at)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUpload
            currentImageUrl={user.avatar_url}
            name={user.full_name}
            entityId={user.id}
            shape="circle"
            label="Profile photo"
            onUpload={async (file) => {
              await authService.uploadAvatar(file);
              await refreshProfile?.();
              toast.success("Profile photo updated");
            }}
            onRemove={async () => {
              await updateProfile({ avatar_url: "" });
              toast.success("Profile photo removed");
            }}
          />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Full name">
              <Input {...register("full_name")} error={errors.full_name?.message} />
            </FormGroup>
            <FormGroup label="Location">
              <Input {...register("location")} />
            </FormGroup>
            <FormGroup label="Phone">
              <Input {...register("phone")} />
            </FormGroup>
            <FormGroup label="Bio">
              <Textarea {...register("bio")} rows={4} />
            </FormGroup>
            <FormGroup label="New password">
              <PasswordInput
                {...register("password")}
                placeholder="Leave blank to keep current"
                error={errors.password?.message}
              />
            </FormGroup>
            <Button type="submit" loading={submitting}>
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminProfilePage() {
  return (
    <AdminShell>
      <ProfileContent />
    </AdminShell>
  );
}
