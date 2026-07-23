"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Bookmark, FileText, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { OnboardingChecklistCard } from "@/components/dashboard/onboarding-checklist-card";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { RecentApplicationsCard } from "@/components/dashboard/recent-applications-card";
import { RecentlyPostedJobsCard } from "@/components/dashboard/recently-posted-jobs-card";
import { RecommendedJobsCard } from "@/components/dashboard/recommended-jobs-card";
import { SavedSearchesCard } from "@/components/dashboard/saved-searches-card";
import { SeekerStatCard } from "@/components/dashboard/seeker-stat-card";
import { PortalLayout } from "@/components/layout/main-layout";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import dashboardService from "@/services/dashboard";
import jobsService from "@/services/jobs";
import savedSearchesService from "@/services/saved-searches";
import { getApiErrorMessage } from "@/lib/api-client";
import type {
  ActivityItem,
  Job,
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

      <RecentlyPostedJobsCard jobs={recentJobs} />

      <SavedSearchesCard
        searches={savedSearches}
        deletingId={deletingId}
        onOpen={openSavedSearch}
        onDelete={deleteSavedSearch}
      />

      <RecommendedJobsCard jobs={data.recommended_jobs ?? []} />

      <RecentApplicationsCard applications={data.applications ?? []} />
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
