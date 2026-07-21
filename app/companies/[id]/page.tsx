"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, ExternalLink, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/cards";
import { EntityAvatar } from "@/components/entity-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Company } from "@/types";

function formatWebsiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = Number(params.id);
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId || Number.isNaN(companyId)) {
      setLoading(false);
      return;
    }
    companiesService
      .getById(companyId)
      .then((data) => setCompany(data))
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <LoadingState message="Loading company profile..." />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <EmptyState
          icon={Building2}
          title="Company not found"
          description="This company profile may no longer exist."
          action={
            <Link href="/companies" className={buttonVariants()}>
              Browse companies
            </Link>
          }
        />
      </div>
    );
  }

  const openJobs = company.jobs ?? [];
  const isOwner =
    isAuthenticated &&
    user?.role === "employer" &&
    user.id === company.owner_id;

  return (
    <div className="bg-surface min-h-screen">
      <div className="hero-gradient border-b border-default">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            <EntityAvatar
              name={company.name}
              imageUrl={company.logo_url}
              entityId={company.id}
              industry={company.industry}
              variant="company"
              className="size-20 shrink-0 rounded-2xl text-2xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-[#FDFDFD]">{company.name}</h1>
                {company.is_verified && (
                  <span className="rounded-full bg-[#FDFDFD]/20 px-2.5 py-0.5 text-xs font-semibold text-[#FDFDFD]">
                    Verified
                  </span>
                )}
              </div>
              {company.industry && (
                <p className="mt-1 text-[#FDFDFD]/80">{company.industry}</p>
              )}
              {company.location && (
                <p className="mt-2 flex items-center gap-1 text-sm text-[#FDFDFD]/70">
                  <MapPin className="h-4 w-4" /> {company.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {company.description ? (
                  <p className="text-subtle whitespace-pre-wrap text-sm leading-relaxed">
                    {company.description}
                  </p>
                ) : (
                  <div className="flex items-start gap-3">
                    <FileText className="text-subtle mt-0.5 h-4 w-4 shrink-0 opacity-40" />
                    <div>
                      <p className="text-subtle text-sm italic opacity-80">
                        This company hasn&apos;t added a description yet.
                      </p>
                      {isOwner && (
                        <Link
                          href="/employer/company"
                          className="mt-2 inline-block text-sm font-medium text-[var(--brand-blue)] hover:underline"
                        >
                          Add a company description →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="text-heading mb-4 text-xl font-bold">
                Open Positions ({openJobs.length})
              </h2>
              {openJobs.length === 0 ? (
                <EmptyState
                  title="No open jobs"
                  description="This company has no active job listings at the moment."
                />
              ) : (
                <div className="grid gap-4">
                  {openJobs.map((job) => (
                    <JobCard key={job.id} job={job} hideCompanyVerified />
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle>Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-subtle text-xs uppercase tracking-wide">Open Roles</p>
                  <p className="text-heading font-medium">{openJobs.length}</p>
                </div>
                {company.founded_year != null && (
                  <div>
                    <p className="text-subtle text-xs uppercase tracking-wide">Founded</p>
                    <p className="text-heading font-medium">{company.founded_year}</p>
                  </div>
                )}
                {company.company_size && (
                  <div>
                    <p className="text-subtle text-xs uppercase tracking-wide">Company Size</p>
                    <p className="text-heading font-medium">{company.company_size}</p>
                  </div>
                )}
                {company.website && (
                  <div>
                    <p className="text-subtle text-xs uppercase tracking-wide">Website</p>
                    <a
                      href={formatWebsiteHref(company.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-heading inline-flex items-center gap-1 font-medium text-[var(--brand-blue)] hover:underline"
                    >
                      Visit website
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
