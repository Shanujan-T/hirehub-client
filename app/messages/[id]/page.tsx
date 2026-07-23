"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ConversationThread } from "@/components/conversation-thread";
import { PortalLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/providers/auth-provider";
import { useParams } from "next/navigation";
import type { UserRole } from "@/types";

function MessageThreadContent() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        href="/messages"
        className="text-subtle inline-flex items-center gap-2 text-sm hover:text-heading"
      >
        <ArrowLeft className="h-4 w-4" /> Back to messages
      </Link>
      <ConversationThread conversationId={id} />
    </div>
  );
}

export default function MessageThreadPage() {
  return (
    <AuthenticatedRoute allowedRoles={["seeker", "employer"]}>
      <MessageThreadPageInner />
    </AuthenticatedRoute>
  );
}

function MessageThreadPageInner() {
  const { user } = useAuth();
  const role = (user?.role ?? "seeker") as UserRole;

  return (
    <PortalLayout role={role}>
      <MessageThreadContent />
    </PortalLayout>
  );
}
