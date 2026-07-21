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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/card";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";

const schema = z.object({
  name: z.string().min(2),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function EditCompanyForm() {
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

  const fetchCompany = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const company = await companiesService.getById(id);
      reset({
        name: company.name,
        industry: company.industry ?? "",
        location: company.location ?? "",
        website: company.website ?? "",
        description: company.description ?? "",
        logo_url: company.logo_url ?? "",
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await companiesService.update(id, {
        name: data.name,
        industry: data.industry || undefined,
        location: data.location || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
        logo_url: data.logo_url || undefined,
      });
      toast.success("Company updated");
      router.push(`/admin/companies/${id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading company..." />;

  return (
    <>
      <Link
        href={`/admin/companies/${id}`}
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to company
      </Link>
      <AdminPageHeader title="Edit Company" />
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Name">
              <Input {...register("name")} error={errors.name?.message} />
            </FormGroup>
            <FormGroup label="Industry">
              <Input {...register("industry")} />
            </FormGroup>
            <FormGroup label="Location">
              <Input {...register("location")} />
            </FormGroup>
            <FormGroup label="Website">
              <Input {...register("website")} error={errors.website?.message} />
            </FormGroup>
            <FormGroup label="Logo URL">
              <Input {...register("logo_url")} error={errors.logo_url?.message} />
            </FormGroup>
            <FormGroup label="Description">
              <Textarea {...register("description")} rows={5} />
            </FormGroup>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                Save Changes
              </Button>
              <Link href={`/admin/companies/${id}`} className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminEditCompanyPage() {
  return (
    <AdminShell>
      <EditCompanyForm />
    </AdminShell>
  );
}
