"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Sparkles } from "lucide-react";
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
import { formatDate, parseApiDate } from "@/lib/utils";
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

function FeaturedPlacementCard({
  company,
  onUpdated,
}: {
  company: Company;
  onUpdated: (company: Company) => void;
}) {
  const [pitch, setPitch] = useState(company.featured_pitch ?? "");
  const [featuring, setFeaturing] = useState(false);
  const active = Boolean(company.is_featured);
  const until = company.featured_until
    ? formatDate(company.featured_until)
    : null;
  const daysLeft = (() => {
    const end = parseApiDate(company.featured_until);
    if (!end) return null;
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
  })();

  useEffect(() => {
    setPitch(company.featured_pitch ?? "");
  }, [company.featured_pitch]);

  const activate = async () => {
    setFeaturing(true);
    try {
      const updated = await companiesService.feature(company.id, {
        days: 30,
        featured_pitch: pitch.trim() || undefined,
      });
      onUpdated(updated);
      toast.success(
        active
          ? "Featured placement renewed for 30 days."
          : "Featured Employer placement activated for 30 days.",
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setFeaturing(false);
    }
  };

  return (
    <Card className="border-default bg-surface-card mt-6 max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-[var(--brand-blue)]" />
          Feature your company
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!company.is_verified ? (
          <div className="rounded-xl border border-default bg-surface-muted p-4 text-sm">
            <p className="text-heading font-medium">Verification required</p>
            <p className="text-subtle mt-1">
              Only verified companies can activate a Featured Employer slot on the
              Jobs browse page. Ask an admin to verify {company.name} first.
            </p>
          </div>
        ) : (
          <>
            <p className="text-subtle text-sm">
              {active && until ? (
                <>
                  Status:{" "}
                  <span className="font-medium text-heading">
                    Active until {until}
                  </span>
                  {daysLeft != null ? (
                    <span> ({daysLeft} day{daysLeft === 1 ? "" : "s"} left)</span>
                  ) : null}
                </>
              ) : (
                <>
                  Status:{" "}
                  <span className="font-medium text-heading">
                    Not currently featured
                  </span>
                </>
              )}
            </p>
            <FormGroup label="Promotional line (optional, max 100 characters)">
              <Input
                value={pitch}
                maxLength={100}
                onChange={(e) => setPitch(e.target.value)}
                placeholder='e.g. "Now hiring 5 roles — apply today."'
              />
            </FormGroup>
            <p className="text-subtle text-xs">
              Shown in the Jobs page sidebar. Leave blank to auto-generate a line
              from your open roles. Demo mode activates without payment.
            </p>
            <Button type="button" loading={featuring} onClick={() => void activate()}>
              {active ? "Renew for 30 days" : "Activate for 30 days"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

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
                placeholder="e.g. Lanka Digital Labs"
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
                  placeholder="e.g. Colombo"
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

      {!isNew && company ? (
        <FeaturedPlacementCard company={company} onUpdated={setCompany} />
      ) : null}
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
