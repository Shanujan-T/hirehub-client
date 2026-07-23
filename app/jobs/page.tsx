"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/search/search-bar";
import { JobCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/form";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import jobsService from "@/services/jobs";
import savedSearchesService from "@/services/saved-searches";
import { getApiErrorMessage } from "@/lib/api-client";
import { PAGE_HEADER_BAND } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";
import { formatLabel, formatSalary } from "@/lib/utils";
import type { Job, JobsQueryParams, JobType, SalaryInsight } from "@/types";

function SalaryInsightsPanel() {
  const searchParams = useSearchParams();
  const [insight, setInsight] = useState<SalaryInsight | null>(null);

  const role = searchParams.get("category") || searchParams.get("q") || "";
  const location = searchParams.get("location") || "";

  useEffect(() => {
    jobsService
      .getSalaryInsights({
        role: role || undefined,
        location: location || undefined,
      })
      .then(setInsight)
      .catch(() => setInsight(null));
  }, [role, location]);

  if (!insight?.count) return null;

  return (
    <div className="mt-4 rounded-2xl border border-default bg-surface-card p-4">
      <h3 className="text-heading text-sm font-bold uppercase tracking-wide">Salary insights</h3>
      <p className="text-subtle mt-2 text-sm">
        {role || "Roles"}
        {location ? ` in ${location}` : ""}:{" "}
        <span className="font-medium text-heading">
          {formatSalary(insight.avg_salary_min, insight.avg_salary_max)}
        </span>{" "}
        avg, based on {insight.count} posting{insight.count !== 1 ? "s" : ""}.
      </p>
    </div>
  );
}

function JobFiltersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [jobType, setJobType] = useState(searchParams.get("job_type") || "");
  const [experience, setExperience] = useState(
    searchParams.get("experience_level") || "",
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    if (jobType) params.set("job_type", jobType);
    else params.delete("job_type");
    if (experience) params.set("experience_level", experience);
    else params.delete("experience_level");
    router.push(`/jobs?${params.toString()}`);
  };

  const clearFilters = () => {
    setCategory("");
    setJobType("");
    setExperience("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("job_type");
    params.delete("experience_level");
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-default bg-surface-card p-5">
      <h2 className="text-heading text-sm font-bold uppercase tracking-wide">Filters</h2>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Engineering"
        />
      </div>

      <div>
        <Label htmlFor="job_type">Job Type</Label>
        <Select
          id="job_type"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="">All types</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {formatLabel(type)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="experience_level">Experience Level</Label>
        <Select
          id="experience_level"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="">All levels</option>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {formatLabel(level)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button type="button" onClick={applyFilters}>
          Apply filters
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}

function SaveSearchPanel() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated || user?.role !== "seeker") return null;

  const filters = {
    keyword: searchParams.get("q") || undefined,
    location: searchParams.get("location") || undefined,
    category: searchParams.get("category") || undefined,
    job_type: (searchParams.get("job_type") as JobType | null) || undefined,
  };

  const hasCriteria = Object.values(filters).some(Boolean);

  const saveSearch = async () => {
    if (!hasCriteria) {
      toast.error("Apply at least one filter or search term before saving.");
      return;
    }
    setSaving(true);
    try {
      await savedSearchesService.create({
        name: name.trim() || undefined,
        filters,
        keywords: filters.keyword,
        category: filters.category,
        location: filters.location,
        job_type: filters.job_type,
      });
      toast.success("Search saved — you'll get alerts for matching jobs.");
      setOpen(false);
      setName("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-default bg-surface-card p-4">
      {!open ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
          <Bookmark className="h-4 w-4" />
          Save this search
        </Button>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="saved-search-name">Search name (optional)</Label>
          <Input
            id="saved-search-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Remote Data Analyst"
          />
          <div className="flex gap-2">
            <Button type="button" className="flex-1" loading={saving} onClick={saveSearch}>
              Save alerts
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function JobsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const filters: JobsQueryParams = {
    q: searchParams.get("q") || undefined,
    location: searchParams.get("location") || undefined,
    category: searchParams.get("category") || undefined,
    job_type: (searchParams.get("job_type") as JobsQueryParams["job_type"]) || undefined,
    experience_level:
      (searchParams.get("experience_level") as JobsQueryParams["experience_level"]) ||
      undefined,
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsService.list(filters);
      setJobs(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.location, filters.category, filters.job_type, filters.experience_level]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <div className={cn("border-b border-default", PAGE_HEADER_BAND)}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-heading text-3xl font-bold">Find Jobs</h1>
          <p className="text-subtle mt-1">
            Discover opportunities that match your skills and goals
          </p>
          <div className="mt-6">
            <SearchBar variant="inline" defaultValues={filters} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside>
            <JobFiltersPanel />
            <Suspense fallback={null}>
              <SaveSearchPanel />
            </Suspense>
            <SalaryInsightsPanel />
          </aside>

          <main>
            <p className="text-subtle mb-4 text-sm">
              {loading ? "Searching..." : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
            </p>

            {loading ? (
              <LoadingState message="Loading jobs..." />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs found"
                description="Try adjusting your filters or search terms."
              />
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function JobsPageWrapper() {
  return (
    <Suspense fallback={<LoadingState message="Loading jobs..." />}>
      <JobsPage />
    </Suspense>
  );
}
