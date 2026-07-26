"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Avatar } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import connectionsService from "@/services/connections";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Connection } from "@/types";

function NetworkContent() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [incoming, setIncoming] = useState<Connection[]>([]);
  const [outgoing, setOutgoing] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    void load();
  }, []);

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
                      <Link href={`/u/${row.requester.username}`} className="text-subtle text-xs hover:underline">
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
              <p className="text-subtle mb-2 text-xs font-semibold uppercase tracking-wide">Sent</p>
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
              description="Connect with people from public profiles and candidate search."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {connections.map((row) => {
                const other = row.other_user;
                return (
                  <li key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-default p-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={other?.full_name ?? "User"}
                        src={other?.avatar_url}
                        entityId={other?.id}
                      />
                      <div>
                        <p className="font-medium text-heading">{other?.full_name}</p>
                        {other?.username ? (
                          <Link href={`/u/${other.username}`} className="text-subtle text-xs hover:underline">
                            @{other.username}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await connectionsService.remove(row.id);
                          toast.success("Connection removed");
                          await load();
                        } catch (err) {
                          toast.error(getApiErrorMessage(err));
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
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
