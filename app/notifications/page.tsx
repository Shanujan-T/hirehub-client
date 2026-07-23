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
import { useAuth } from "@/providers/auth-provider";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification, UserRole } from "@/types";

function NotificationsContent() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    socialService
      .getNotifications()
      .then((data) => setItems(data.notifications))
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

  const openItem = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await socialService.markNotificationRead(notification.id);
        setItems((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n,
          ),
        );
      } catch {
        // navigate anyway
      }
    }
  };

  if (loading) return <LoadingState message="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-heading">Notifications</h1>
          <p className="text-subtle mt-1">Stay updated on applications, messages, and matches</p>
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
          {items.map((n) => {
            const href = n.link || n.link_url;
            const title = n.title || n.message;
            const body =
              n.body && n.body !== title
                ? n.body
                : n.message !== title
                  ? n.message
                  : null;
            const content = (
              <>
                <p className="font-medium text-heading">{title}</p>
                {body ? <p className="text-subtle mt-1 text-sm">{body}</p> : null}
                <p className="text-subtle mt-1 text-xs">{formatRelativeTime(n.created_at)}</p>
              </>
            );
            return (
              <Card
                key={n.id}
                className={`border-default bg-surface-card ${!n.is_read ? "ring-1 ring-[var(--brand-blue)]/30" : ""}`}
              >
                <CardContent className="p-4">
                  {href ? (
                    <Link href={href} className="block" onClick={() => void openItem(n)}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="block w-full text-left"
                      onClick={() => void openItem(n)}
                    >
                      {content}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const role = (user?.role ?? "seeker") as UserRole;

  return (
    <AuthenticatedRoute>
      <PortalLayout role={role}>
        <NotificationsContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
