"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { CommunityCard } from "@/components/cards";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Community } from "@/types";

export function MyCommunitiesView() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [leavingId, setLeavingId] = useState<number | null>(null);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await socialService.getMineCommunities();
      setCommunities(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleLeave = async (communityId: number) => {
    setCommunities((prev) => prev.filter((c) => c.id !== communityId));
    setLeavingId(communityId);

    try {
      await socialService.leaveCommunity(communityId);
      toast.success("Left community.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      await fetchCommunities();
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
            My Communities
          </h1>
          <p className="text-subtle mt-1 text-sm sm:text-base">
            Communities you&apos;ve joined
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your communities..." />
      ) : communities.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You haven't joined any communities yet."
          description="Discover groups relevant to your industry and interests."
          action={
            <Link href="/communities" className={buttonVariants()}>
              Browse Communities
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              mode="my-communities"
              onLeave={handleLeave}
              leaveLoading={leavingId === community.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
