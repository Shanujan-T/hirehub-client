"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, ExternalLink, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/cards";
import { BackLink } from "@/components/back-link";
import { EntityAvatar } from "@/components/entity-avatar";
import { PostCard } from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";
import { Avatar } from "@/components/ui/shared";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";

function formatWebsiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = Number(params.id);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [employees, setEmployees] = useState<import("@/types").CompanyEmployee[]>([]);
  const [companyPosts, setCompanyPosts] = useState<import("@/types").Post[]>([]);

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

    companiesService.getEmployees(companyId).then(setEmployees).catch(() => setEmployees([]));
    companiesService.getPosts(companyId).then(setCompanyPosts).catch(() => setCompanyPosts([]));
  }, [companyId]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "seeker" || !companyId) return;
    companiesService
      .followStatus(companyId)
      .then(setFollowing)
      .catch(() => setFollowing(false));
  }, [isAuthenticated, user?.role, companyId]);

  const toggleFollow = async () => {
    if (!company) return;
    setFollowBusy(true);
    try {
      if (following) {
        await companiesService.unfollow(company.id);
        setFollowing(false);
        toast.success("Unfollowed company");
      } else {
        await companiesService.follow(company.id);
        setFollowing(true);
        toast.success("Following company");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setFollowBusy(false);
    }
  };

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
  const canFollow = isAuthenticated && user?.role === "seeker" && !isOwner;
  const showSignInToFollow = !authLoading && !isAuthenticated;

  return (
    <div className="bg-surface min-h-screen">
      <div className="hero-gradient border-b border-default">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <BackLink
            href="/companies"
            label="Back to Companies"
            variant="onDark"
            className="mb-6"
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-6">
              <EntityAvatar
                name={company.name}
                imageUrl={company.logo_url}
                entityId={company.id}
                industry={company.industry}
                variant="company"
                className="size-16 shrink-0 rounded-2xl text-xl sm:size-20 sm:text-2xl"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold break-words text-[#FDFDFD] sm:text-3xl">
                    {company.name}
                  </h1>
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
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{" "}
                    {company.location}
                  </p>
                )}
              </div>
            </div>
            {canFollow ? (
              <Button
                type="button"
                variant={following ? "onDarkOutline" : "onDark"}
                loading={followBusy}
                onClick={toggleFollow}
                aria-pressed={following}
                className="w-fit shrink-0 self-start whitespace-nowrap"
              >
                {following ? "Following ✓" : "Follow"}
              </Button>
            ) : showSignInToFollow ? (
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: "onDarkOutline" }),
                  "w-fit shrink-0 self-start whitespace-nowrap",
                )}
              >
                Sign in to follow this company →
              </Link>
            ) : isOwner ? (
              <span className="inline-flex w-fit shrink-0 self-start rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-[#FDFDFD]/85">
                Your company
              </span>
            ) : null}
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
                {company.avg_response_time_days != null ? (
                  <div className="rounded-lg border border-[var(--brand-blue)]/20 bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))] px-3 py-2">
                    <p className="text-xs font-semibold text-[var(--brand-blue)]">
                      Usually responds within {company.avg_response_time_days} day
                      {company.avg_response_time_days === 1 ? "" : "s"}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>

        <hr className="my-12 border-t border-default" />

        {employees.length > 0 ? (
          <section aria-label="Employees" className="mb-12">
            <h2 className="text-heading mb-2 text-xl font-bold">
              People who work here ({employees.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((person) => (
                <div key={person.id} className="flex items-center gap-3 rounded-xl border border-default bg-surface-card p-3">
                  <Avatar name={person.full_name} src={person.avatar_url} entityId={person.id} />
                  <div>
                    <p className="font-medium text-heading">{person.full_name}</p>
                    <p className="text-subtle text-xs">{person.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {companyPosts.length > 0 ? (
          <section aria-label="Company updates" className="mb-12">
            <h2 className="text-heading mb-2 text-xl font-bold">Company updates</h2>
            <p className="text-subtle mb-4 text-sm">Posts from this company</p>
            <div className="space-y-4 max-w-3xl">
              {companyPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        <hr className="my-12 border-t border-default" />

        <section
          aria-label="Open positions"
          className="rounded-2xl bg-surface-muted px-4 py-10 sm:px-6"
        >
          <div className="mb-6">
            <h2 className="text-heading text-xl font-bold sm:text-2xl">
              Open Positions ({openJobs.length})
            </h2>
            <p className="text-subtle mt-1 text-sm">
              Active roles currently hiring at this company
            </p>
          </div>
          {openJobs.length === 0 ? (
            <EmptyState
              title="No open jobs"
              description="This company has no active job listings at the moment."
            />
          ) : (
            <div className="grid gap-3">
              {openJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="list"
                  hideCompanyVerified
                  hideCompanyAvatar
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
