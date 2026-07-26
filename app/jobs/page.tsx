"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FeaturedEmployerCard } from "@/components/featured-employer-card";
import { SearchBar } from "@/components/search/search-bar";
import { JobCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/form";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import jobsService from "@/services/jobs";
import savedSearchesService from "@/services/saved-searches";
import aiService from "@/services/ai";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [plainEnglish, setPlainEnglish] = useState(false);
  const [nlQuery, setNlQuery] = useState("");
  const [nlSearching, setNlSearching] = useState(false);

  const q = searchParams.get("q") || undefined;
  const location = searchParams.get("location") || undefined;
  const category = searchParams.get("category") || undefined;
  const jobType =
    (searchParams.get("job_type") as JobsQueryParams["job_type"]) || undefined;
  const experienceLevel =
    (searchParams.get("experience_level") as JobsQueryParams["experience_level"]) ||
    undefined;

  const filters: JobsQueryParams = {
    q,
    location,
    category,
    job_type: jobType,
    experience_level: experienceLevel,
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsService.list({
        q,
        location,
        category,
        job_type: jobType,
        experience_level: experienceLevel,
      });
      setJobs(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [q, location, category, jobType, experienceLevel]);

  useEffect(() => {
    if (plainEnglish) return;
    let cancelled = false;
    void (async () => {
      // Defer so the first setState is not synchronous inside the effect body.
      await Promise.resolve();
      if (cancelled) return;
      await fetchJobs();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchJobs, plainEnglish]);

  const runPlainEnglishSearch = async () => {
    const query = nlQuery.trim();
    if (query.length < 4) {
      toast.error("Try a fuller sentence, e.g. remote data jobs in Colombo.");
      return;
    }
    setNlSearching(true);
    setLoading(true);
    try {
      const result = await aiService.parseSearch(query);
      setJobs(result.jobs);
      const params = new URLSearchParams();
      const f = result.filters;
      if (f.q) params.set("q", f.q);
      if (f.location) params.set("location", f.location);
      if (f.category) params.set("category", f.category);
      if (f.job_type) params.set("job_type", f.job_type);
      if (f.experience_level) params.set("experience_level", f.experience_level);
      const qs = params.toString();
      router.replace(qs ? `/jobs?${qs}` : "/jobs");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setJobs([]);
    } finally {
      setNlSearching(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <div className={cn("border-b border-default", PAGE_HEADER_BAND)}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-heading text-3xl font-bold">Find Jobs</h1>
          <p className="text-subtle mt-1">
            Discover opportunities that match your skills and goals
          </p>
          <div className="mt-4">
            <label className="inline-flex items-center gap-2 text-sm text-heading">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--brand-blue)]"
                checked={plainEnglish}
                onChange={(e) => setPlainEnglish(e.target.checked)}
              />
              Search in plain English
            </label>
          </div>
          <div className="mt-4">
            {plainEnglish ? (
              <div className="space-y-3 rounded-2xl border border-default bg-surface-card p-3 shadow-sm">
                <Input
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder='e.g. "find me remote data jobs in Colombo"'
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void runPlainEnglishSearch();
                    }
                  }}
                />
                <Button
                  type="button"
                  loading={nlSearching}
                  onClick={() => void runPlainEnglishSearch()}
                >
                  <Sparkles className="h-4 w-4" />
                  Search with AI
                </Button>
              </div>
            ) : (
              <SearchBar variant="inline" defaultValues={filters} />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside>
            <JobFiltersPanel />
            <FeaturedEmployerCard />
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
