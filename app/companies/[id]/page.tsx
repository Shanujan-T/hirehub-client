"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, ExternalLink, MapPin } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { buttonVariants } from "@/components/ui/button";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Company } from "@/types";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = Number(params.id);
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

  return (
    <div className="bg-surface min-h-screen">
      <div className="hero-gradient border-b border-default">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="h-20 w-20 rounded-2xl border border-[#FDFDFD]/20 bg-[#FDFDFD] object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FDFDFD]/10">
                <Building2 className="h-10 w-10 text-[#FDFDFD]" />
              </div>
            )}
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
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#F94D32] hover:underline"
                >
                  {company.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
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
                <p className="text-subtle whitespace-pre-wrap text-sm leading-relaxed">
                  {company.description || "No company description available."}
                </p>
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
                    <JobCard key={job.id} job={job} />
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
                {company.industry && (
                  <div>
                    <p className="text-subtle text-xs uppercase tracking-wide">Industry</p>
                    <p className="text-heading font-medium">{company.industry}</p>
                  </div>
                )}
                {company.location && (
                  <div>
                    <p className="text-subtle text-xs uppercase tracking-wide">Location</p>
                    <p className="text-heading font-medium">{company.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-subtle text-xs uppercase tracking-wide">Open Roles</p>
                  <p className="text-heading font-medium">{openJobs.length}</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
