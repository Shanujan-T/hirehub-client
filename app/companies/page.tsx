"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, Search } from "lucide-react";
import { toast } from "sonner";
import { CompanyCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";
import { PAGE_HEADER_BAND } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";

function CompaniesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const queryQ = searchParams.get("q")?.toLowerCase() || "";
  const queryIndustry = searchParams.get("industry")?.toLowerCase() || "";
  const queryLocation = searchParams.get("location")?.toLowerCase() || "";

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await companiesService.list();
      setCompanies(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchesQ =
        !queryQ ||
        company.name.toLowerCase().includes(queryQ) ||
        (company.description?.toLowerCase().includes(queryQ) ?? false);
      const matchesIndustry =
        !queryIndustry || (company.industry?.toLowerCase().includes(queryIndustry) ?? false);
      const matchesLocation =
        !queryLocation || (company.location?.toLowerCase().includes(queryLocation) ?? false);
      return matchesQ && matchesIndustry && matchesLocation;
    });
  }, [companies, queryQ, queryIndustry, queryLocation]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (industry) params.set("industry", industry);
    if (location) params.set("location", location);
    router.push(`/companies?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <div className={cn("border-b border-default", PAGE_HEADER_BAND)}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-heading text-3xl font-bold">Browse Companies</h1>
          <p className="text-subtle mt-1">
            Explore employers and discover their open positions
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleFilter}
          className="mb-8 grid gap-4 rounded-2xl border border-default bg-surface-card p-6 sm:grid-cols-4"
        >
          <div>
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Company name..."
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or region"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <Search className="h-4 w-4" /> Filter
            </Button>
          </div>
        </form>

        {loading ? (
          <LoadingState message="Loading companies..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies found"
            description="Try different search terms or filters."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompaniesPageWrapper() {
  return (
    <Suspense fallback={<LoadingState message="Loading companies..." />}>
      <CompaniesPage />
    </Suspense>
  );
}
