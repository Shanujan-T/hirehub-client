"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ConversationThread } from "@/components/conversation-thread";
import { PortalLayout } from "@/components/layout/main-layout";
import { LoadingState } from "@/app/_components/page-states";
import conversationsService from "@/services/conversations";
import { getApiErrorMessage } from "@/lib/api-client";

function ApplicationMessagesContent() {
  const params = useParams();
  const applicationId = Number(params.id);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationsService
      .createForApplication(applicationId)
      .then((conversation) => {
        setConversationId(conversation.id);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [applicationId]);

  if (loading) return <LoadingState message="Opening conversation..." />;
  if (!conversationId) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href={`/applications/${applicationId}`}
        className="text-subtle inline-flex items-center gap-2 text-sm hover:text-heading"
      >
        <ArrowLeft className="h-4 w-4" /> Back to application
      </Link>
      <ConversationThread conversationId={conversationId} />
    </div>
  );
}

export default function ApplicationMessagesPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker"]}>
      <PortalLayout role="seeker">
        <ApplicationMessagesContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
