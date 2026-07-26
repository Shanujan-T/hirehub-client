"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { PortaledPopover } from "@/components/ui/portaled-popover";
import type { Notification } from "@/types";

const POLL_MS = 20_000;
const PANEL_LIMIT = 12;

export function NotificationBell() {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const closePanel = useCallback(() => setOpen(false), []);

  const load = useCallback(async (silent = true) => {
    if (!silent) setLoading(true);
    try {
      const data = await socialService.getNotifications();
      setItems(data.notifications.slice(0, PANEL_LIMIT));
      setUnreadCount(data.unread_count);
    } catch {
      if (!silent) toast.error("Could not load notifications");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
    const timer = window.setInterval(() => void load(true), POLL_MS);
    const onFocus = () => void load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const openPanel = () => {
    setOpen((prev) => !prev);
    void load(false);
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await socialService.markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  };

  const openItem = async (notification: Notification) => {
    const href = notification.link || notification.link_url;
    if (!notification.is_read) {
      try {
        await socialService.markNotificationRead(notification.id);
        setItems((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // still navigate
      }
    }
    setOpen(false);
    if (href) router.push(href);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={openPanel}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-default bg-surface-card text-subtle transition-colors hover:text-heading"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span
            className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--brand-rose)] px-1 text-[10px] font-bold leading-4 text-white"
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      <PortaledPopover
        open={open}
        onClose={closePanel}
        anchorRef={buttonRef}
        align="end"
        role="dialog"
        aria-label="Notifications panel"
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-default bg-surface-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-default px-3 py-2">
          <p className="text-sm font-semibold text-heading">Notifications</p>
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={markingAll}
                onClick={() => void markAll()}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-blue)] hover:underline disabled:opacity-60"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-subtle hover:text-heading"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="slim-scrollbar max-h-80 overflow-y-auto">
          {loading && items.length === 0 ? (
            <p className="text-subtle px-3 py-6 text-center text-sm">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-subtle px-3 py-6 text-center text-sm">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul>
              {items.map((item) => {
                const title = item.title || item.message;
                const body =
                  item.body && item.body !== title
                    ? item.body
                    : item.message !== title
                      ? item.message
                      : null;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void openItem(item)}
                      className={cn(
                        "w-full border-b border-default px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface-muted",
                        !item.is_read &&
                          "bg-[color-mix(in_srgb,var(--brand-blue)_6%,transparent)]",
                      )}
                    >
                      <p className="text-sm font-medium text-heading">{title}</p>
                      {body ? (
                        <p className="text-subtle mt-0.5 line-clamp-2 text-xs">
                          {body}
                        </p>
                      ) : null}
                      <p className="text-subtle mt-1 text-[11px]">
                        {formatRelativeTime(item.created_at)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PortaledPopover>
    </div>
  );
}

export default NotificationBell;
