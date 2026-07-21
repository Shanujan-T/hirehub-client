"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JobSearchParams {
  q?: string;
  location?: string;
  category?: string;
  job_type?: string;
  experience_level?: string;
}

interface SearchBarProps {
  variant?: "hero" | "inline";
  defaultValues?: JobSearchParams;
  className?: string;
}

export function SearchBar({
  variant = "inline",
  defaultValues = {},
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValues.q ?? "");
  const [location, setLocation] = useState(defaultValues.location ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmedQ = query.trim();
    const trimmedLocation = location.trim();
    if (trimmedQ) params.set("q", trimmedQ);
    if (trimmedLocation) params.set("location", trimmedLocation);
    if (defaultValues.category) params.set("category", defaultValues.category);
    if (defaultValues.job_type) params.set("job_type", defaultValues.job_type);
    if (defaultValues.experience_level) params.set("experience_level", defaultValues.experience_level);

    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  const isHero = variant === "hero";

  const inputClassName = cn(
    "min-w-0 w-full flex-1 rounded-lg border border-default bg-surface py-2.5 pl-10 pr-3 text-sm text-heading",
    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
    "focus:border-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-blue)_25%,transparent)]",
    isHero && "sm:py-3",
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        isHero
          ? "rounded-2xl border border-[#0c44b7]/15 bg-white/95 p-2 shadow-2xl backdrop-blur-md sm:p-3 dark:border-white/10 dark:bg-[rgba(12,12,22,0.85)]"
          : "rounded-2xl border border-default bg-surface-card p-2 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-subtle" />
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, keywords, or company"
            className={inputClassName}
          />
        </label>

        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-[14rem] lg:max-w-xs">
          <MapPin className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-subtle" />
          <input
            type="text"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or remote"
            className={inputClassName}
          />
        </label>

        <button
          type="submit"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl brand-gradient glow-btn px-6 font-semibold text-white",
            isHero ? "py-3" : "py-2.5",
          )}
        >
          <Search className="h-4 w-4" />
          Search jobs
        </button>
      </div>
    </form>
  );
}
