"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ConversationInbox } from "@/components/conversation-inbox";
import { PortalLayout } from "@/components/layout/main-layout";
import { LoadingState } from "@/app/_components/page-states";
import conversationsService from "@/services/conversations";
import { getApiErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import type { Conversation, UserRole } from "@/types";

function MessagesContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationsService
      .list()
      .then(setConversations)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading conversations..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Messages</h1>
        <p className="text-subtle mt-1">
          Conversations tied to your job applications
        </p>
      </div>
      <ConversationInbox conversations={conversations} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker", "employer"]}>
      <MessagesPageInner />
    </AuthenticatedRoute>
  );
}

function MessagesPageInner() {
  const { user } = useAuth();
  const role = (user?.role ?? "seeker") as UserRole;

  return (
    <PortalLayout role={role}>
      <MessagesContent />
    </PortalLayout>
  );
}
