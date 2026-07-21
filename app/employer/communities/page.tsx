"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { CommunityCard } from "@/components/cards";
import { PortalLayout } from "@/components/layout/main-layout";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { PageHeader } from "@/app/employer/_components/page-header";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Community } from "@/types";

function EmployerCommunitiesContent() {
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
      <PageHeader
        title="My Communities"
        description="Communities you've joined"
      />

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

export default function EmployerCommunitiesPage() {
  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalLayout role="employer">
        <EmployerCommunitiesContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
