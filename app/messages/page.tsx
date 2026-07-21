"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import socialService from "@/services/social";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Conversation } from "@/types";

function otherParticipantName(c: Conversation, userId?: number) {
  if (!userId) return `Conversation #${c.id}`;
  if (c.participant_one_id === userId) {
    return c.participant_two?.full_name ?? `User #${c.participant_two_id}`;
  }
  return c.participant_one?.full_name ?? `User #${c.participant_one_id}`;
}

function MessagesContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialService
      .getMyConversations()
      .then(setConversations)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading conversations..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Messages</h1>
        <p className="text-subtle mt-1">Direct conversations with employers and mentors</p>
      </div>
      {conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet" description="Start a conversation from a profile." />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`}>
              <Card className="border-default bg-surface-card card-hover">
                <CardContent className="p-4">
                  <p className="font-semibold text-heading">
                    {otherParticipantName(c, user?.id)}
                  </p>
                  <p className="text-subtle mt-1 text-xs">{formatDate(c.created_at)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AuthenticatedRoute>
      <PortalLayout role="seeker">
        <MessagesContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
