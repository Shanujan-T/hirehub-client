"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MessageSquare, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { OpenToWorkBadge } from "@/components/open-to-work-badge";
import { Avatar } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import connectionsService from "@/services/connections";
import conversationsService from "@/services/conversations";
import usersService from "@/services/users";
import { getApiErrorMessage } from "@/lib/api-client";
import { getRoleBadgeClass } from "@/lib/post-utils";
import { cn, formatLabel } from "@/lib/utils";
import type { Connection, DiscoverUser } from "@/types";

function NetworkContent() {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [incoming, setIncoming] = useState<Connection[]>([]);
  const [outgoing, setOutgoing] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageBusyId, setMessageBusyId] = useState<number | null>(null);

  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverLoadingMore, setDiscoverLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "seeker" | "employer">("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [connectBusyId, setConnectBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [list, requests] = await Promise.all([
        connectionsService.list(),
        connectionsService.listRequests(),
      ]);
      setConnections(list);
      setIncoming(requests.incoming);
      setOutgoing(requests.outgoing);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadDiscover = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setDiscoverLoadingMore(true);
      else setDiscoverLoading(true);
      try {
        const data = await usersService.discover({
          search: search || undefined,
          role: roleFilter || undefined,
          page: nextPage,
          per_page: 16,
        });
        setDiscoverUsers((prev) => (append ? [...prev, ...data.users] : data.users));
        setPage(data.page);
        setHasMore(data.has_more);
        setTotal(data.total);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        if (!append) setDiscoverUsers([]);
      } finally {
        setDiscoverLoading(false);
        setDiscoverLoadingMore(false);
      }
    },
    [search, roleFilter],
  );

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!discoverOpen) return;
    void loadDiscover(1, false);
  }, [discoverOpen, loadDiscover]);

  const handleConnect = async (userId: number) => {
    setConnectBusyId(userId);
    try {
      await connectionsService.request(userId);
      setPendingIds((prev) => new Set(prev).add(userId));
      setDiscoverUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Connection request sent");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setConnectBusyId(null);
    }
  };

  const handleMessage = async (connectionId: number) => {
    setMessageBusyId(connectionId);
    try {
      const conversation = await conversationsService.createForConnection(connectionId);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setMessageBusyId(null);
    }
  };

  if (loading) return <LoadingState message="Loading your network..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title text-3xl">My Network</h1>
        <p className="text-subtle mt-1">Accepted connections and pending requests</p>
      </div>

      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Pending requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incoming.length === 0 ? (
            <p className="text-subtle text-sm">No incoming requests.</p>
          ) : (
            incoming.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={row.requester?.full_name ?? "User"}
                    src={row.requester?.avatar_url}
                    entityId={row.requester_id}
                  />
                  <div>
                    <p className="font-medium text-heading">{row.requester?.full_name}</p>
                    {row.requester?.username ? (
                      <Link
                        href={`/u/${row.requester.username}`}
                        className="text-subtle text-xs hover:underline"
                      >
                        @{row.requester.username}
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await connectionsService.accept(row.id);
                        toast.success("Connected");
                        await load();
                        if (discoverOpen) void loadDiscover(1, false);
                      } catch (err) {
                        toast.error(getApiErrorMessage(err));
                      }
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await connectionsService.decline(row.id);
                        toast.success("Declined");
                        await load();
                      } catch (err) {
                        toast.error(getApiErrorMessage(err));
                      }
                    }}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
          {outgoing.length > 0 ? (
            <div className="border-t border-default pt-3">
              <p className="text-subtle mb-2 text-xs font-semibold uppercase tracking-wide">
                Sent
              </p>
              {outgoing.map((row) => (
                <p key={row.id} className="text-subtle text-sm">
                  Waiting on {row.recipient?.full_name}
                </p>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-default bg-surface-card">
        <CardHeader>
          <CardTitle>Connections ({connections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No connections yet"
              description="Browse people below or connect from public profiles."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {connections.map((row) => {
                const other = row.other_user;
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-default p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={other?.full_name ?? "User"}
                        src={other?.avatar_url}
                        entityId={other?.id}
                      />
                      <div>
                        <p className="font-medium text-heading">{other?.full_name}</p>
                        {other?.username ? (
                          <Link
                            href={`/u/${other.username}`}
                            className="text-subtle text-xs hover:underline"
                          >
                            @{other.username}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#0C44B7]/40 text-[#0C44B7] hover:bg-[#0C44B7]/10 dark:border-[#22d3ee]/40 dark:text-[#22d3ee] dark:hover:bg-[#22d3ee]/10"
                        loading={messageBusyId === row.id}
                        onClick={() => void handleMessage(row.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await connectionsService.remove(row.id);
                            toast.success("Connection removed");
                            await load();
                            if (discoverOpen) void loadDiscover(1, false);
                          } catch (err) {
                            toast.error(getApiErrorMessage(err));
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Discover people — secondary / collapsible */}
      <Card className="border-default bg-surface-card border-dashed opacity-95">
        <CardHeader className="pb-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            onClick={() => setDiscoverOpen((o) => !o)}
            aria-expanded={discoverOpen}
          >
            <div>
              <CardTitle className="text-base font-semibold text-heading">
                Discover people
              </CardTitle>
              <p className="text-subtle mt-1 text-sm">
                Browse other members and send connection requests
                {total > 0 && discoverOpen ? ` · ${total} available` : ""}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "text-subtle h-5 w-5 shrink-0 transition-transform",
                discoverOpen && "rotate-180",
              )}
            />
          </button>
        </CardHeader>

        {discoverOpen ? (
          <CardContent className="space-y-4 border-t border-default pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch(searchInput.trim());
                }}
              >
                <div className="relative flex-1">
                  <Search className="text-subtle pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name…"
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" className="shrink-0">
                  Search
                </Button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { value: "", label: "All" },
                    { value: "seeker", label: "Seekers" },
                    { value: "employer", label: "Employers" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setRoleFilter(opt.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      roleFilter === opt.value
                        ? "border-[#0C44B7] bg-[#0C44B7] text-white"
                        : "border-default text-subtle hover:border-[#0C44B7]/40 hover:text-heading",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {discoverLoading ? (
              <LoadingState message="Loading people..." />
            ) : discoverUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No people to show"
                description={
                  search || roleFilter
                    ? "Try a different search or filter."
                    : "Everyone you can connect with is already in your network."
                }
              />
            ) : (
              <>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {discoverUsers.map((user) => {
                    const isPending = pendingIds.has(user.id);
                    return (
                      <li
                        key={user.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-default bg-surface p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            name={user.full_name}
                            src={user.avatar_url}
                            entityId={user.id}
                            openToWork={Boolean(user.open_to_work)}
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {user.username ? (
                                <Link
                                  href={`/u/${user.username}`}
                                  className="truncate font-medium text-heading hover:underline"
                                >
                                  {user.full_name}
                                </Link>
                              ) : (
                                <p className="truncate font-medium text-heading">
                                  {user.full_name}
                                </p>
                              )}
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                  getRoleBadgeClass(user.role),
                                )}
                              >
                                {formatLabel(user.role)}
                              </span>
                              {user.open_to_work ? <OpenToWorkBadge /> : null}
                            </div>
                            {user.headline ? (
                              <p className="text-subtle mt-0.5 line-clamp-1 text-xs">
                                {user.headline}
                              </p>
                            ) : user.location ? (
                              <p className="text-subtle mt-0.5 text-xs">{user.location}</p>
                            ) : null}
                          </div>
                        </div>
                        {isPending ? (
                          <Button size="sm" variant="outline" disabled>
                            Pending
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={connectBusyId === user.id}
                            onClick={() => void handleConnect(user.id)}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Connect
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {hasMore ? (
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      loading={discoverLoadingMore}
                      onClick={() => void loadDiscover(page + 1, true)}
                    >
                      Load more
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <AuthenticatedRoute>
      <PortalLayout>
        <NetworkContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
