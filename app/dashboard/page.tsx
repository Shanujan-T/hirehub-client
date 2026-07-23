"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Bookmark,
  FileText,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { OnboardingChecklistCard } from "@/components/dashboard/onboarding-checklist-card";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { SeekerStatCard } from "@/components/dashboard/seeker-stat-card";
import { PortalLayout } from "@/components/layout/main-layout";
import { JobCard } from "@/components/cards/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/shared";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import dashboardService from "@/services/dashboard";
import jobsService from "@/services/jobs";
import savedSearchesService from "@/services/saved-searches";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatLabel } from "@/lib/utils";
import type {
  ActivityItem,
  Job,
  OnboardingChecklistItem,
  SavedSearch,
  SeekerDashboard,
  SeekerStats,
} from "@/types";

function SeekerDashboardContent() {
  const router = useRouter();
  const [data, setData] = useState<SeekerDashboard | null>(null);
  const [stats, setStats] = useState<SeekerStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardService.get(),
      dashboardService.getStats(),
      dashboardService.getActivity(),
      jobsService.list({ sort: "recent", limit: 5, status: "open" }),
      savedSearchesService.list(),
    ])
      .then(([dashboard, seekerStats, seekerActivity, jobs, searches]) => {
        if (dashboard.role === "seeker") setData(dashboard);
        setStats(seekerStats);
        setActivity(seekerActivity);
        setRecentJobs(jobs);
        setSavedSearches(searches);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const deleteSavedSearch = async (id: number) => {
    setDeletingId(id);
    try {
      await savedSearchesService.delete(id);
      setSavedSearches((prev) => prev.filter((row) => row.id !== id));
      toast.success("Saved search removed");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const openSavedSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    const filters = search.filters ?? {};
    const keyword = filters.keyword || search.keywords;
    if (keyword) params.set("q", keyword);
    if (filters.location || search.location) {
      params.set("location", filters.location || search.location || "");
    }
    if (filters.category || search.category) {
      params.set("category", filters.category || search.category || "");
    }
    if (filters.job_type || search.job_type) {
      params.set("job_type", filters.job_type || search.job_type || "");
    }
    router.push(`/jobs?${params.toString()}`);
  };

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (!data || !stats) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Dashboard unavailable"
        description="Could not load your dashboard data."
      />
    );
  }

  const completionScore = data.profile_completion_score ?? 0;
  const checklist = data.onboarding_checklist ?? [];
  const incompleteItems = checklist.filter((item) => !item.completed);
  const hasSkills = checklist.find((item) => item.key === "has_skills")?.completed ?? true;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider brand-gradient-text">
          Welcome back
        </p>
        <h1 className="section-title mt-1 text-3xl">Dashboard</h1>
        <p className="text-subtle mt-1">Track applications and discover recommended jobs</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SeekerStatCard
          label="Applications sent"
          value={stats.applications_sent}
          icon={FileText}
          href="/applications"
        />
        <SeekerStatCard
          label="Jobs saved"
          value={stats.jobs_saved}
          icon={Bookmark}
          href="/saved-jobs"
        />
        <SeekerStatCard
          label="Communities joined"
          value={stats.communities_joined}
          icon={Users}
          href="/my-communities"
        />
      </div>

      {!hasSkills ? (
        <EmptyState
          icon={Sparkles}
          title="Add your first skill to get job recommendations"
          description="Tell us what you're good at and we'll surface matching roles."
          action={
            <Link href="/my/skills/new" className="text-sm font-semibold text-[var(--brand-blue)]">
              Add a skill →
            </Link>
          }
        />
      ) : null}

      <ProfileCompletionCard
        completionScore={completionScore}
        incompleteItems={incompleteItems}
        badges={data.badges}
      />

      <OnboardingChecklistCard items={checklist} completionScore={completionScore} />

      <RecentActivityCard activity={activity} />

      <Card className="glass-card overflow-hidden border-default">
        <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-orange)_8%,var(--surface-card))]">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Recently posted
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4 lg:grid-cols-2">
          {recentJobs.length ? (
            recentJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No open jobs yet"
              description="Check back soon for new opportunities."
              action={
                <Link href="/jobs" className="text-sm font-semibold text-[var(--brand-blue)]">
                  Browse jobs →
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden border-default">
        <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))]">
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved searches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {savedSearches.length ? (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-default p-4"
              >
                <button type="button" onClick={() => openSavedSearch(search)} className="text-left">
                  <p className="font-semibold text-heading">
                    {search.name || search.keywords || search.category || "Saved search"}
                  </p>
                  <p className="text-subtle mt-1 text-xs">
                    {[
                      search.keywords,
                      search.location,
                      search.job_type ? formatLabel(search.job_type) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Custom filters"}
                  </p>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  loading={deletingId === search.id}
                  onClick={() => deleteSavedSearch(search.id)}
                  aria-label="Delete saved search"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-default bg-surface-muted px-4 py-6 text-center">
              <p className="text-subtle text-sm">
                Save a search from the Jobs page to get notified when new matching jobs are
                posted.
              </p>
              <Link
                href="/jobs"
                className="mt-3 inline-block text-sm font-semibold text-[var(--brand-blue)] hover:underline"
              >
                Go to Jobs →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden border-default">
        <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-magenta)_8%,var(--surface-card))]">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#e040fb]" />
            Recommended for you
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {data.recommended_jobs?.length ? (
            data.recommended_jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No recommendations yet"
              description="Add more skills to improve your job matches."
              action={
                <Link href="/my/skills/new" className="text-sm font-semibold text-[var(--brand-blue)]">
                  Add skills →
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden border-default">
        <CardHeader className="border-b border-default bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))]">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent applications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {data.applications?.length ? (
            data.applications.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between rounded-xl border border-default p-4 transition-colors hover:bg-surface-muted"
              >
                <div>
                  <p className="font-semibold text-heading">{app.job?.title ?? "Job"}</p>
                  <p className="text-subtle text-sm">{formatDate(app.created_at)}</p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="Browse jobs and apply to get started"
              description="Your application history will appear here once you apply."
              action={
                <Link href="/jobs" className="text-sm font-semibold text-[var(--brand-blue)]">
                  Browse jobs →
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SeekerDashboardPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <SeekerDashboardContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
