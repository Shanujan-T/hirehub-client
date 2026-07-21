"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/app/_components/page-states";
import socialService from "@/services/social";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Message } from "@/types";

function MessageThreadContent() {
  const params = useParams();
  const id = Number(params.id);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = () => {
    socialService
      .getMessages(id)
      .then(setMessages)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await socialService.sendMessage(id, { body: body.trim() });
      setBody("");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState message="Loading messages..." />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link href="/messages" className="text-subtle inline-flex items-center gap-2 text-sm hover:text-heading">
        <ArrowLeft className="h-4 w-4" /> Back to messages
      </Link>
      <Card className="border-default bg-surface-card min-h-[420px]">
        <CardContent className="flex h-full flex-col p-4">
          <div className="flex-1 space-y-3 overflow-y-auto pb-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender_id === user?.id
                    ? "ml-auto bg-[var(--brand-blue)] text-white"
                    : "bg-surface-muted text-heading"
                }`}
              >
                <p>{m.body}</p>
                <p className="mt-1 text-[10px] opacity-70">{formatDate(m.created_at)}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-default pt-4">
            <Input
              placeholder="Type a message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button onClick={send} disabled={sending || !body.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MessageThreadPage() {
  return (
    <AuthenticatedRoute>
      <PortalLayout role="seeker">
        <MessageThreadContent />
      </PortalLayout>
    </AuthenticatedRoute>
  );
}
