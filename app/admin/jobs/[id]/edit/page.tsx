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
import { Textarea } from "@/components/ui/card";
import jobsService from "@/services/jobs";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  JOB_TYPES,
} from "@/lib/constants";
import { formatLabel } from "@/lib/utils";
import type { JobStatus, JobType, ExperienceLevel } from "@/types";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  job_type: z.enum(JOB_TYPES),
  experience_level: z.enum(EXPERIENCE_LEVELS),
  location: z.string().optional(),
  salary_min: z.coerce.number().optional().or(z.literal("")),
  salary_max: z.coerce.number().optional().or(z.literal("")),
  deadline: z.string().optional(),
  status: z.enum(JOB_STATUSES),
});

type FormValues = z.infer<typeof schema>;

function EditJobForm() {
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
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const fetchJob = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const job = await jobsService.getById(id);
      reset({
        title: job.title,
        description: job.description ?? "",
        category: job.category ?? "",
        job_type: job.job_type,
        experience_level: job.experience_level,
        location: job.location ?? "",
        salary_min: job.salary_min ?? "",
        salary_max: job.salary_max ?? "",
        deadline: job.deadline?.slice(0, 10) ?? "",
        status: job.status,
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await jobsService.update(id, {
        title: data.title,
        description: data.description || undefined,
        category: data.category || undefined,
        job_type: data.job_type as JobType,
        experience_level: data.experience_level as ExperienceLevel,
        location: data.location || undefined,
        salary_min: data.salary_min === "" ? undefined : Number(data.salary_min),
        salary_max: data.salary_max === "" ? undefined : Number(data.salary_max),
        deadline: data.deadline || undefined,
        status: data.status as JobStatus,
      });
      toast.success("Job updated");
      router.push(`/admin/jobs/${id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading job..." />;

  return (
    <>
      <Link
        href={`/admin/jobs/${id}`}
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to job
      </Link>
      <AdminPageHeader title="Edit Job" />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Title">
              <Input {...register("title")} error={errors.title?.message} />
            </FormGroup>
            <FormGroup label="Category">
              <Input {...register("category")} />
            </FormGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormGroup label="Job type">
                <Select {...register("job_type")}>
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {formatLabel(t)}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Experience">
                <Select {...register("experience_level")}>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {formatLabel(l)}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>
            <FormGroup label="Status">
              <Select {...register("status")}>
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {formatLabel(s)}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Location">
              <Input {...register("location")} />
            </FormGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormGroup label="Min salary">
                <Input type="number" {...register("salary_min")} />
              </FormGroup>
              <FormGroup label="Max salary">
                <Input type="number" {...register("salary_max")} />
              </FormGroup>
            </div>
            <FormGroup label="Deadline">
              <Input type="date" {...register("deadline")} />
            </FormGroup>
            <FormGroup label="Description">
              <Textarea {...register("description")} rows={6} />
            </FormGroup>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
              <Link href={`/admin/jobs/${id}`} className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminEditJobPage() {
  return (
    <AdminShell>
      <EditJobForm />
    </AdminShell>
  );
}
