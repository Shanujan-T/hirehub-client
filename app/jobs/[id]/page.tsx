"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingState, EmptyState, FormGroup } from "@/app/_components/page-states";
import { JobCard } from "@/components/cards/index";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/shared";
import { useAuth } from "@/providers/auth-provider";
import jobsService from "@/services/jobs";
import applicationsService from "@/services/applications";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn, formatDate, formatLabel, formatSalary, resolveMediaUrl } from "@/lib/utils";
import type { Job } from "@/types";

const applySchema = z.object({
  cover_letter: z
    .string()
    .min(20, "Cover letter must be at least 20 characters")
    .max(5000, "Cover letter is too long"),
});

type ApplyForm = z.infer<typeof applySchema>;

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const jobId = Number(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyForm>({ resolver: zodResolver(applySchema) });

  useEffect(() => {
    if (!jobId || Number.isNaN(jobId)) {
      setLoading(false);
      return;
    }
    jobsService
      .getById(jobId)
      .then((data) => setJob(data))
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));

    jobsService
      .getSimilar(jobId)
      .then(setSimilarJobs)
      .catch(() => setSimilarJobs([]));
  }, [jobId]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role !== "seeker") {
      toast.error("Only job seekers can save jobs.");
      return;
    }
    setSaving(true);
    try {
      if (saved) {
        await jobsService.unsave(jobId);
        setSaved(false);
        toast.success("Job removed from saved list.");
      } else {
        await jobsService.save(jobId);
        setSaved(true);
        toast.success("Job saved successfully.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const scrollToApply = () => {
    document.getElementById("apply-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role !== "seeker") {
      toast.error("Only job seekers can apply to jobs.");
      return;
    }
    scrollToApply();
  };

  const onApply = async (data: ApplyForm) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role !== "seeker") {
      toast.error("Only job seekers can apply to jobs.");
      return;
    }
    setApplying(true);
    try {
      await applicationsService.create({
        job_id: jobId,
        cover_letter: data.cover_letter,
      });
      setApplied(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <LoadingState message="Loading job details..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <EmptyState
          title="Job not found"
          description="This job may have been removed or is no longer available."
          action={
            <Link href="/jobs" className={buttonVariants()}>
              Back to jobs
            </Link>
          }
        />
      </div>
    );
  }

  const canApply = job.status === "open";
  const showSeekerActions = isAuthenticated && user?.role === "seeker" && canApply;
  const bannerSrc = resolveMediaUrl(job.image_url);

  return (
    <div
      className={cn(
        "bg-surface min-h-screen py-8",
        canApply && !applied && (showSeekerActions || !isAuthenticated) && "pb-24 lg:pb-8",
      )}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section aria-label="Job details">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <div className="space-y-6">
              {bannerSrc && (
                <div className="overflow-hidden rounded-2xl border border-default">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerSrc}
                    alt=""
                    className="aspect-[2/1] w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>{formatLabel(job.job_type)}</Badge>
                  <Badge>{formatLabel(job.experience_level)}</Badge>
                  {job.status !== "open" && <StatusBadge status={job.status} />}
                </div>

                <div>
                  <h1 className="text-heading text-3xl font-bold">{job.title}</h1>
                  {job.company && (
                    <Link
                      href={`/companies/${job.company.id}`}
                      className="mt-2 inline-flex items-center gap-2 text-[#0C44B7] hover:underline dark:text-[#22d3ee]"
                    >
                      <Building2 className="h-4 w-4" />
                      {job.company.name}
                      {job.company.is_verified && (
                        <span className="rounded bg-[#0C44B7]/10 px-1.5 py-0.5 text-xs font-semibold text-[#0C44B7] dark:text-[#22d3ee]">
                          Verified
                        </span>
                      )}
                    </Link>
                  )}
                </div>

                <div className="text-subtle flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {job.location}
                    </span>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <span className="text-heading font-medium">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </span>
                  )}
                  {job.created_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Posted {formatDate(job.created_at)}
                    </span>
                  )}
                </div>

                {canApply && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {applied ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Applied
                      </span>
                    ) : showSeekerActions ? (
                      <Button onClick={handleApplyClick}>
                        <Send className="h-4 w-4" />
                        Apply Now
                      </Button>
                    ) : !isAuthenticated ? (
                      <Link href="/auth/login" className={buttonVariants()}>
                        <Send className="h-4 w-4" />
                        Sign in to Apply
                      </Link>
                    ) : null}

                    {showSeekerActions && (
                      <Button
                        variant="outline"
                        onClick={handleSaveToggle}
                        disabled={saving}
                      >
                        {saved ? (
                          <>
                            <BookmarkCheck className="h-4 w-4 text-[#0C44B7]" /> Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4" /> Save Job
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[#133099]/90 dark:text-heading/90">
                    {job.description || "No description provided."}
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-6">
                      <p className="text-heading mb-2 text-sm font-semibold">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((js) => (
                          <span
                            key={js.id}
                            className="rounded-full bg-[color-mix(in_srgb,var(--brand-blue)_10%,var(--surface-muted))] px-3 py-1 text-xs font-medium text-heading"
                          >
                            {js.skill?.name ?? "Skill"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {showSeekerActions && (
                <Card id="apply-section" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle>Apply for this position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applied ? (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        You have already applied to this job.
                      </p>
                    ) : (
                      <form onSubmit={handleSubmit(onApply)} className="space-y-4">
                        <FormGroup label="Cover Letter">
                          <Textarea
                            {...register("cover_letter")}
                            rows={6}
                            placeholder="Tell the employer why you're a great fit..."
                            error={errors.cover_letter?.message}
                          />
                        </FormGroup>
                        <Button type="submit" disabled={applying}>
                          <Send className="h-4 w-4" />
                          {applying ? "Submitting..." : "Submit Application"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              {job.company && (
                <Card>
                  <CardHeader>
                    <CardTitle>About the Company</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-heading font-semibold">{job.company.name}</p>
                    {job.company.industry && (
                      <p className="text-subtle text-sm">{job.company.industry}</p>
                    )}
                    {job.company.location && (
                      <p className="text-subtle flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5" /> {job.company.location}
                      </p>
                    )}
                    {job.company.description && (
                      <p className="text-subtle line-clamp-4 text-sm">{job.company.description}</p>
                    )}
                    {job.company.website && (
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#0C44B7] hover:underline dark:text-[#22d3ee]"
                      >
                        Visit website
                      </a>
                    )}
                    <Link
                      href={`/companies/${job.company.id}`}
                      className={buttonVariants({ variant: "outline", className: "w-full text-center" })}
                    >
                      View company profile
                    </Link>
                  </CardContent>
                </Card>
              )}

              {canApply && !applied && showSeekerActions && (
                <Button className="hidden w-full lg:inline-flex" onClick={handleApplyClick}>
                  <Send className="h-4 w-4" />
                  Apply Now
                </Button>
              )}

              {showSeekerActions && (
                <Button
                  variant="outline"
                  className="hidden w-full lg:inline-flex"
                  onClick={handleSaveToggle}
                  disabled={saving}
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-[#0C44B7]" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" /> Save Job
                    </>
                  )}
                </Button>
              )}
            </aside>
          </div>
        </section>

        {similarJobs.length > 0 ? (
          <>
            <hr className="my-12 border-t border-default" />
            <section
              aria-label="Similar jobs"
              className={cn(
                "mt-16 rounded-2xl bg-surface-muted px-4 py-12 sm:px-6",
              )}
            >
              <div className="mb-6">
                <h2 className="text-heading text-2xl font-bold">Similar Jobs</h2>
                <p className="text-subtle mt-1 text-sm">
                  Other roles that match required skills
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {similarJobs.map((similar) => (
                  <JobCard key={similar.id} job={similar} variant="compact" />
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>

      {canApply && !applied && (showSeekerActions || !isAuthenticated) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-surface/95 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-5xl gap-3">
            {showSeekerActions ? (
              <>
                <Button className="flex-1" onClick={handleApplyClick}>
                  <Send className="h-4 w-4" />
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSaveToggle}
                  disabled={saving}
                  aria-label={saved ? "Unsave job" : "Save job"}
                >
                  {saved ? (
                    <BookmarkCheck className="h-4 w-4 text-[#0C44B7]" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : (
              <Link href="/auth/login" className={buttonVariants({ className: "flex-1" })}>
                Sign in to Apply
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
