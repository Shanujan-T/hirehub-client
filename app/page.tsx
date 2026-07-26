"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/search/search-bar";
import { JobCard } from "@/components/cards";
import { buttonVariants } from "@/components/ui/button";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import jobsService from "@/services/jobs";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  BTN_BRAND_GRADIENT,
  BTN_CYAN_OUTLINE,
  HERO_LANDING_BG,
  SECTION_BRAND_TINT,
} from "@/lib/constants";
import type { Job } from "@/types";

const stats = [
  { label: "Active Jobs", value: "2,400+", icon: Briefcase, gradient: "from-[#0C44B7] to-[#22d3ee]" },
  { label: "Companies", value: "850+", icon: Building2, gradient: "from-[#5A299A] to-[#e040fb]" },
  { label: "Job Seekers", value: "12,000+", icon: Users, gradient: "from-[#AB2F74] to-[#DA3753]" },
  { label: "Hires This Month", value: "340+", icon: TrendingUp, gradient: "from-[#F94D32] to-[#fbbf24]" },
];

const steps = [
  {
    step: "01",
    title: "Create your profile",
    description: "Sign up as a seeker or employer and build a profile that stands out.",
    icon: Users,
    accent: "linear-gradient(135deg, #0C44B7, #22d3ee)",
  },
  {
    step: "02",
    title: "Discover opportunities",
    description: "Search with smart filters and get skill-matched job recommendations.",
    icon: Sparkles,
    accent: "linear-gradient(135deg, #5A299A, #e040fb)",
  },
  {
    step: "03",
    title: "Connect & get hired",
    description: "Apply in one click, track applications, and join career communities.",
    icon: Zap,
    accent: "linear-gradient(135deg, #F94D32, #fbbf24)",
  },
];

export default function LandingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsService
      .list()
      .then((data) => setJobs(data.slice(0, 6)))
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col transition-colors duration-300">
      {/* Hero */}
      <section className={cn("hero-pattern relative overflow-hidden", HERO_LANDING_BG)}>
        <div className="animate-mesh-drift absolute inset-0 opacity-40 dark:opacity-100">
          <div
            className="mesh-glow -left-32 top-0 h-[28rem] w-[28rem] opacity-40 dark:opacity-50"
            style={{ background: "#22d3ee" }}
          />
          <div
            className="mesh-glow -right-16 top-16 h-80 w-80 opacity-35 dark:opacity-45"
            style={{ background: "#e040fb" }}
          />
          <div
            className="mesh-glow bottom-0 left-1/3 h-72 w-72 opacity-25 dark:opacity-35"
            style={{ background: "#f97316" }}
          />
        </div>
        <div className="absolute inset-0 bg-white/40 dark:bg-[#050505]/65" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-indigo-50/60 to-[var(--surface)] dark:via-transparent dark:to-[var(--surface)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy + search */}
            <div className="text-center text-[#041b5f] lg:text-left dark:text-white">
              <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-[#0c44b7]/20 bg-white/80 px-5 py-2 text-sm font-semibold text-[#041b5f] backdrop-blur-md dark:border-white/20 dark:bg-white/10 dark:text-white">
                <MapPin className="h-4 w-4 text-cyan-600 dark:text-[#22d3ee]" />
                Local jobs. Real opportunities.
              </div>
              <h1 className="animate-fade-up animate-fade-up-delay-1 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Find Work That{" "}
                <span className="brand-gradient-text">Fits Your Skills</span>
              </h1>
              <p className="animate-fade-up animate-fade-up-delay-2 mx-auto mt-5 max-w-xl text-lg text-[#1e293b]/90 lg:mx-0 dark:text-white/85">
                HireHub connects local talent with top employers. Search, apply, and grow — all in one beautiful platform.
              </p>
              <div className="animate-fade-up animate-fade-up-delay-3 mx-auto mt-8 w-full max-w-xl lg:mx-0 lg:max-w-none">
                <SearchBar variant="hero" />
              </div>
              <div className="animate-fade-up animate-fade-up-delay-4 mt-7 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link
                  href="/auth/register"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "ghost" }),
                    "rounded-xl",
                    BTN_BRAND_GRADIENT,
                  )}
                >
                  Start Free <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/jobs"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "ghost" }),
                    "rounded-xl",
                    BTN_CYAN_OUTLINE,
                  )}
                >
                  Browse All Jobs
                </Link>
              </div>
            </div>

            {/* Right: skill-match visual anchor */}
            <div className="animate-fade-up animate-fade-up-delay-5 relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div
                className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full opacity-50 blur-3xl dark:opacity-40"
                style={{ background: "#22d3ee" }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-10 -left-8 h-44 w-44 rounded-full opacity-40 blur-3xl dark:opacity-35"
                style={{ background: "#e040fb" }}
                aria-hidden
              />

              <div className="animate-hero-float relative">
                <div className="relative z-10 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[0_24px_60px_-12px_rgba(4,27,95,0.28)] backdrop-blur-md dark:border-white/10 dark:bg-[#0c0c16]/90 dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0C44B7] dark:text-[#22d3ee]">
                        Skill match
                      </p>
                      <h2 className="mt-1 font-display text-lg font-bold text-heading">
                        Data Analyst
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-subtle">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        Lanka Digital Labs
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#0C44B7] to-[#22d3ee] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      85% match
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["SQL", "Python", "Tableau"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-default bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-heading"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-default pt-3 text-xs text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Colombo
                    </span>
                    <span className="font-medium text-heading">Full-time · Remote</span>
                  </div>
                </div>

                {/* Secondary offset card */}
                <div
                  className="absolute -bottom-6 -left-4 z-0 hidden w-[85%] -rotate-3 rounded-xl border border-white/50 bg-white/70 p-3 shadow-lg backdrop-blur-sm sm:block dark:border-white/10 dark:bg-[#12121e]/75"
                  aria-hidden
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5A299A] to-[#AB2F74]">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-heading">
                        Frontend Engineer
                      </p>
                      <p className="text-[10px] text-subtle">72% skill match</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 -mt-12 px-4 transition-colors duration-300 sm:px-6 lg:px-8">
        <div className="glass-card mx-auto grid max-w-5xl grid-cols-2 gap-4 rounded-2xl p-6 sm:grid-cols-4 lg:p-8">
          {stats.map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="stat-card px-4 py-5 text-center">
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-extrabold text-heading">{value}</p>
              <p className="text-subtle mt-1 text-xs font-semibold uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className={cn("py-20 transition-colors duration-300", SECTION_BRAND_TINT)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider brand-gradient-text">
                Latest Openings
              </p>
              <h2 className="section-title mt-1 text-3xl">Featured Jobs</h2>
              <p className="text-subtle mt-2">Fresh opportunities from local employers</p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl accent-gradient glow-btn px-4 py-2 text-sm font-semibold text-white"
            >
              View all jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Loading featured jobs..." />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No jobs available yet"
              description="Check back soon for new opportunities."
              action={
                <Link href="/jobs" className={buttonVariants()}>
                  Browse jobs
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="brand-gradient-line mx-auto max-w-6xl opacity-80" />

      {/* How it works */}
      <section className={cn("py-20 transition-colors duration-300", SECTION_BRAND_TINT)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-sm font-bold uppercase tracking-wider brand-gradient-text">
              How It Works
            </p>
            <h2 className="section-title mt-2 text-3xl">Three Steps to Success</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ step, title, description, icon: Icon, accent }) => (
              <div
                key={step}
                className="glass-card group relative overflow-hidden rounded-2xl p-8 card-hover"
              >
                <span className="text-6xl font-black text-[color-mix(in_srgb,var(--brand-blue)_8%,transparent)]">
                  {step}
                </span>
                <div
                  className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110"
                  style={{ background: accent }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="section-title mt-5 text-xl">{title}</h3>
                <p className="text-subtle mt-2 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seeker / Employer */}
      <section className={cn("py-20 transition-colors duration-300", SECTION_BRAND_TINT)}>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:px-8">
          <div className={cn("relative overflow-hidden rounded-3xl shadow-2xl", HERO_LANDING_BG)}>
            <div className="absolute inset-0 bg-white/30 dark:bg-[#050505]/70" />
            <div className="hero-pattern absolute inset-0 opacity-20 dark:opacity-30" />
            <div
              className="mesh-glow left-0 top-0 h-48 w-48 opacity-40"
              style={{ background: "#22d3ee" }}
            />
            <div className="relative p-8 text-[#041b5f] dark:text-white lg:p-10">
              <Briefcase className="h-12 w-12 text-cyan-600 dark:text-[#22d3ee]" />
              <h3 className="mt-6 font-display text-2xl font-extrabold">For Job Seekers</h3>
              <p className="mt-3 leading-relaxed text-[#1e293b]/90 dark:text-white/85">
                Build your skill profile, get personalized recommendations, and track every application.
              </p>
              <ul className="mt-6 space-y-2.5">
                {["Skill-based matching", "One-click apply", "Career communities"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#334155] dark:text-white/90">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-600 dark:text-[#22d3ee]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register?role=seeker"
                className={cn(
                  buttonVariants({ size: "lg", variant: "ghost" }),
                  "mt-8 rounded-xl",
                  BTN_BRAND_GRADIENT,
                )}
              >
                Create Seeker Account
              </Link>
            </div>
          </div>

          <div className="glass-card relative overflow-hidden rounded-3xl p-8 card-hover lg:p-10">
            <div className="brand-gradient-line mb-6 w-16" />
            <Building2 className="h-12 w-12 text-[#e040fb]" />
            <h3 className="section-title mt-2 text-2xl">For Employers</h3>
            <p className="text-subtle mt-3 leading-relaxed">
              Post jobs, review applicants, search candidates by skills, and build your brand.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["Applicant pipeline", "Candidate search", "Company profile"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-subtle">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#AB2F74]" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register?role=employer"
              className={buttonVariants({ variant: "secondary", size: "lg", className: "glow-btn mt-8 rounded-xl" })}
            >
              Create Employer Account
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={cn("relative overflow-hidden py-20 transition-colors duration-300", HERO_LANDING_BG)}>
        <div className="hero-pattern absolute inset-0 opacity-15 dark:opacity-25" />
        <div
          className="mesh-glow left-1/4 top-1/2 h-64 w-64 -translate-y-1/2 opacity-30 dark:opacity-40"
          style={{ background: "#e040fb" }}
        />
        <div
          className="mesh-glow right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 opacity-25 dark:opacity-35"
          style={{ background: "#f97316" }}
        />
        <div className="absolute inset-0 bg-white/35 dark:bg-[#050505]/60" />
        <div className="relative mx-auto max-w-3xl px-4 text-center text-[#041b5f] dark:text-white sm:px-6">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#1e293b]/90 dark:text-white/85">
            Join thousands of professionals already using HireHub to advance their careers.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
                "rounded-xl",
                BTN_BRAND_GRADIENT,
              )}
            >
              Join HireHub Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/jobs"
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
                "rounded-xl",
                BTN_CYAN_OUTLINE,
              )}
            >
              Explore Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
