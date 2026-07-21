"use client";



import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { toast } from "sonner";

import { AuthenticatedRoute } from "@/components/auth-guard";

import { PortalLayout } from "@/components/layout/main-layout";

import { ResumeUpload } from "@/components/resume-upload";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label, Select } from "@/components/ui/form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LoadingState } from "@/app/_components/page-states";

import { useAuth } from "@/providers/auth-provider";

import authService from "@/services/auth";

import { EDUCATION_LEVELS } from "@/lib/constants";

import { getApiErrorMessage } from "@/lib/api-client";

import { resolveMediaUrl } from "@/lib/utils";

import type { EducationLevel } from "@/types";



const schema = z.object({

  full_name: z.string().min(2, "Name is required"),

  bio: z.string().optional(),

  location: z.string().optional(),

  phone: z.string().optional(),

  education_level: z.string().optional(),

});



type FormData = z.infer<typeof schema>;



function ProfileContent() {

  const { user, updateProfile, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);

  const {

    register,

    handleSubmit,

    reset,

    formState: { errors },

  } = useForm<FormData>({ resolver: zodResolver(schema) });



  useEffect(() => {

    if (user) {

      reset({

        full_name: user.full_name,

        bio: user.bio ?? "",

        location: user.location ?? "",

        phone: user.phone ?? "",

        education_level: user.education_level ?? "",

      });

    }

  }, [user, reset]);



  if (!user) return <LoadingState />;



  const onSubmit = async (data: FormData) => {

    setSaving(true);

    try {

      await updateProfile({

        full_name: data.full_name,

        bio: data.bio || undefined,

        location: data.location || undefined,

        phone: data.phone || undefined,

        education_level: (data.education_level as EducationLevel) || undefined,

      });

      toast.success("Profile updated");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

    } finally {

      setSaving(false);

    }

  };



  const handleResumeUpload = async (file: File) => {

    try {

      await authService.uploadResume(file);

      await refreshProfile();

      toast.success("Resume uploaded");

    } catch (err) {

      toast.error(getApiErrorMessage(err));

      throw err;

    }

  };



  const resumeHref = resolveMediaUrl(user.resume_url);



  return (

    <div className="mx-auto max-w-2xl space-y-6">

      <div>

        <h1 className="font-display text-3xl font-extrabold text-heading">Profile</h1>

        <p className="text-subtle mt-1">Update your professional information</p>

      </div>

      <Card className="border-default bg-surface-card">

        <CardHeader>

          <CardTitle>Personal details</CardTitle>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>

              <Label htmlFor="full_name">Full name</Label>

              <Input id="full_name" {...register("full_name")} />

              {errors.full_name && (

                <p className="mt-1 text-sm text-[var(--brand-rose)]">{errors.full_name.message}</p>

              )}

            </div>

            <div>

              <Label htmlFor="bio">Bio</Label>

              <Input id="bio" {...register("bio")} />

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <Label htmlFor="location">Location</Label>

                <Input id="location" {...register("location")} />

              </div>

              <div>

                <Label htmlFor="phone">Phone</Label>

                <Input id="phone" {...register("phone")} />

              </div>

            </div>

            <div>

              <Label htmlFor="education_level">Education level</Label>

              <Select id="education_level" {...register("education_level")}>

                <option value="">Select level</option>

                {EDUCATION_LEVELS.map((level) => (

                  <option key={level} value={level}>

                    {level}

                  </option>

                ))}

              </Select>

            </div>

            <Button type="submit" disabled={saving}>

              {saving ? "Saving..." : "Save profile"}

            </Button>

          </form>

        </CardContent>

      </Card>



      <Card className="border-default bg-surface-card">

        <CardHeader>

          <CardTitle>Resume</CardTitle>

        </CardHeader>

        <CardContent className="space-y-4">

          {resumeHref ? (

            <a

              href={resumeHref}

              target="_blank"

              rel="noopener noreferrer"

              className="text-sm font-medium text-[var(--brand-blue)] hover:underline"

            >

              View current resume

            </a>

          ) : null}

          <ResumeUpload currentResumeUrl={user.resume_url} onUpload={handleResumeUpload} />

        </CardContent>

      </Card>

    </div>

  );

}



export default function ProfilePage() {

  return (

    <AuthenticatedRoute>

      <PortalLayout role="seeker">

        <ProfileContent />

      </PortalLayout>

    </AuthenticatedRoute>

  );

}

