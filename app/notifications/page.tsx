"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/types";

function NotificationsContent() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    socialService
      .getNotifications()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markAllRead = async () => {
    try {
      await socialService.markAllNotificationsRead();
      toast.success("All notifications marked as read");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState message="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-heading">Notifications</h1>
          <p className="text-subtle mt-1">Stay updated on your applications and matches</p>
        </div>
        {items.some((n) => !n.is_read) && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={`border-default bg-surface-card ${!n.is_read ? "ring-1 ring-[var(--brand-blue)]/30" : ""}`}>
              <CardContent className="p-4">
                {n.link_url ? (
                  <Link href={n.link_url} className="block">
                    <p className="font-medium text-heading">{n.message}</p>
                    <p className="text-subtle mt-1 text-xs">{formatDate(n.created_at)}</p>
                  </Link>
                ) : (
                  <>
                    <p className="font-medium text-heading">{n.message}</p>
                    <p className="text-subtle mt-1 text-xs">{formatDate(n.created_at)}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthenticatedRoute>
      <PortalLayout role="seeker">
        <NotificationsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
