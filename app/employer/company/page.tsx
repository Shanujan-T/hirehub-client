"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/card";
import { Badge } from "@/components/ui/shared";
import { FormGroup, LoadingState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import { AvatarUpload } from "@/components/avatar-upload";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Company } from "@/types";

const companySchema = z.object({
  name: z.string().min(2, "Company name is required").max(200),
  industry: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  founded_year: z
    .union([z.literal(""), z.coerce.number().int().min(1800).max(new Date().getFullYear())])
    .optional(),
  company_size: z.string().max(50).optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

function CompanyProfileContent() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      description: "",
      website: "",
      location: "",
      founded_year: "",
      company_size: "",
    },
  });

  useEffect(() => {
    companiesService
      .getMy()
      .then((data) => {
        setCompany(data);
        reset({
          name: data.name,
          industry: data.industry ?? "",
          description: data.description ?? "",
          website: data.website ?? "",
          location: data.location ?? "",
          founded_year: data.founded_year ?? "",
          company_size: data.company_size ?? "",
        });
      })
      .catch((err) => {
        const message = getApiErrorMessage(err);
        if (message.toLowerCase().includes("not found")) {
          setIsNew(true);
        } else {
          toast.error(message);
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: CompanyForm) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        industry: data.industry || undefined,
        description: data.description || undefined,
        website: data.website || undefined,
        location: data.location || undefined,
        founded_year: data.founded_year === "" || data.founded_year == null ? null : Number(data.founded_year),
        company_size: data.company_size || undefined,
      };

      if (isNew) {
        const created = await companiesService.create(payload);
        setCompany(created);
        setIsNew(false);
        toast.success("Company profile created!");
      } else if (company) {
        const updated = await companiesService.update(company.id, payload);
        setCompany(updated);
        toast.success("Company profile updated!");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading company profile..." />;
  }

  return (
    <>
      <PageHeader
        title={isNew ? "Create Company Profile" : "Company Profile"}
        description={
          isNew
            ? "Set up your company before posting jobs."
            : "Manage your company information visible to candidates."
        }
      />

      <Card className="border-default bg-surface-card max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--brand-blue)]" />
            {isNew ? "New company" : company?.name}
          </CardTitle>
          {company?.is_verified && <Badge variant="success">Verified</Badge>}
        </CardHeader>
        <CardContent>
          {!isNew && company && (
            <div className="mb-6 border-b border-default pb-6">
              <AvatarUpload
                currentImageUrl={company.logo_url}
                name={company.name}
                entityId={company.id}
                industry={company.industry}
                variant="company"
                shape="rounded-square"
                label="Company logo"
                onUpload={async (file) => {
                  const updated = await companiesService.uploadLogo(company.id, file);
                  setCompany(updated);
                  toast.success("Company logo updated");
                }}
                onRemove={async () => {
                  const updated = await companiesService.update(company.id, { logo_url: "" });
                  setCompany(updated);
                  toast.success("Company logo removed");
                }}
              />
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormGroup label="Company name">
              <Input
                {...register("name")}
                placeholder="Acme Inc."
                error={errors.name?.message}
              />
            </FormGroup>

            <FormGroup label="Industry">
              <Input
                {...register("industry")}
                placeholder="e.g. Technology"
                error={errors.industry?.message}
              />
            </FormGroup>

            <FormGroup label="Description">
              <Textarea
                {...register("description")}
                rows={5}
                placeholder="Tell candidates about your company..."
                error={errors.description?.message}
              />
            </FormGroup>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormGroup label="Website">
                <Input
                  {...register("website")}
                  placeholder="https://example.com"
                  error={errors.website?.message}
                />
              </FormGroup>

              <FormGroup label="Location">
                <Input
                  {...register("location")}
                  placeholder="e.g. San Francisco, CA"
                  error={errors.location?.message}
                />
              </FormGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormGroup label="Founded year">
                <Input
                  {...register("founded_year")}
                  type="number"
                  placeholder="e.g. 2015"
                  error={errors.founded_year?.message}
                />
              </FormGroup>

              <FormGroup label="Company size">
                <Input
                  {...register("company_size")}
                  placeholder="e.g. 11-50 employees"
                  error={errors.company_size?.message}
                />
              </FormGroup>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting}>
                {isNew ? "Create company" : "Save changes"}
              </Button>
              {!isNew && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/employer/dashboard")}
                >
                  Back to dashboard
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function EmployerCompanyPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <CompanyProfileContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
