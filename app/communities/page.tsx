"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { CommunityCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/form";
import { LoadingState, EmptyState } from "@/app/_components/page-states";
import { useAuth } from "@/providers/auth-provider";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { COMMUNITY_TYPES, PAGE_HEADER_BAND } from "@/lib/constants";
import { cn, formatLabel } from "@/lib/utils";
import type { CommunitiesQueryParams, Community } from "@/types";

function CommunitiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const filters: CommunitiesQueryParams = useMemo(
    () => ({
      q: searchParams.get("q") || undefined,
      type: (searchParams.get("type") as CommunitiesQueryParams["type"]) || undefined,
      location: searchParams.get("location") || undefined,
    }),
    [searchParams],
  );

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await socialService.listCommunitiesForUser(
        filters,
        isAuthenticated,
      );
      setCommunities(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.type, filters.location, isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    fetchCommunities();
  }, [fetchCommunities, authLoading, token]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    router.push(`/communities?${params.toString()}`);
  };

  const handleJoin = async (communityId: number) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId
          ? {
              ...c,
              is_member: true,
              member_count: (c.member_count ?? 0) + 1,
            }
          : c,
      ),
    );
    setJoiningId(communityId);

    try {
      await socialService.joinCommunity(communityId);
      toast.success("Joined community!");
      const data = await socialService.listCommunitiesForUser(
        filters,
        isAuthenticated,
      );
      setCommunities(data);
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (message.toLowerCase().includes("already a member")) {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === communityId ? { ...c, is_member: true } : c,
          ),
        );
        toast.success("Joined community!");
        return;
      }
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? {
                ...c,
                is_member: false,
                member_count: Math.max(0, (c.member_count ?? 1) - 1),
              }
            : c,
        ),
      );
      toast.error(message);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <div className={cn("border-b border-default", PAGE_HEADER_BAND)}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-heading text-3xl font-bold">Communities</h1>
          <p className="text-subtle mt-1">
            Join groups based on industry, location, profession, and interests
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
              placeholder="Community name..."
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              {COMMUNITY_TYPES.map((communityType) => (
                <option key={communityType} value={communityType}>
                  {formatLabel(communityType)}
                </option>
              ))}
            </Select>
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
          <LoadingState message="Loading communities..." />
        ) : communities.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No communities found"
            description="Try adjusting your filters or check back later."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={handleJoin}
                joinLoading={joiningId === community.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommunitiesPageWrapper() {
  return (
    <Suspense fallback={<LoadingState message="Loading communities..." />}>
      <CommunitiesPage />
    </Suspense>
  );
}
