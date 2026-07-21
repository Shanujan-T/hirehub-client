"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { StatusBadge } from "@/components/ui/shared";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import applicationsService from "@/services/applications";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/types";

function ApplicationsContent() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsService
      .getMy()
      .then(setApps)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading applications..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">My Applications</h1>
        <p className="text-subtle mt-1">Track every job you have applied to</p>
      </div>
      {apps.length === 0 ? (
        <EmptyState title="No applications" description="Apply to jobs to see them here." />
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Link key={app.id} href={`/applications/${app.id}`}>
              <Card className="border-default bg-surface-card card-hover">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-semibold text-heading">{app.job?.title ?? "Job"}</p>
                    <p className="text-subtle text-sm">{app.job?.company?.name}</p>
                    <p className="text-subtle mt-1 text-xs">{formatDate(app.created_at)}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <ApplicationsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
