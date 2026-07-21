"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/shared";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import type { Mentorship } from "@/types";

function MentorshipContent() {
  const [items, setItems] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentorId, setMentorId] = useState("");
  const [requesting, setRequesting] = useState(false);

  const load = () => {
    socialService
      .getMyMentorships()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const request = async () => {
    if (!mentorId) return;
    setRequesting(true);
    try {
      await socialService.createMentorship({ mentor_id: Number(mentorId) });
      toast.success("Mentorship requested");
      setMentorId("");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <LoadingState message="Loading mentorships..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Mentorship</h1>
        <p className="text-subtle mt-1">Connect with mentors for career guidance</p>
      </div>
      <Card className="border-default bg-surface-card">
        <CardHeader><CardTitle>Request a mentor</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="Mentor user ID"
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={request} disabled={requesting || !mentorId}>
            {requesting ? "Requesting..." : "Send request"}
          </Button>
        </CardContent>
      </Card>
      {items.length === 0 ? (
        <EmptyState title="No mentorships yet" description="Request a mentor to get started." />
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <Card key={m.id} className="border-default bg-surface-card">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-heading">
                    {m.mentor?.full_name ?? `Mentor #${m.mentor_id}`}
                  </p>
                  <p className="text-subtle text-sm">Mentee: {m.mentee?.full_name ?? m.mentee_id}</p>
                </div>
                <StatusBadge status={m.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MentorshipPage() {
  return (
    <AuthenticatedRoute>
      <PortalLayout role="seeker">
        <MentorshipContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
