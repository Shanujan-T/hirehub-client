"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/form";
import { Textarea } from "@/components/ui/card";
import conversationsService from "@/services/conversations";
import reportsService from "@/services/reports";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import type { Conversation, Message } from "@/types";

const POLL_INTERVAL_MS = 12000;
const MAX_MESSAGE_LENGTH = 2000;

export function ConversationThread({
  conversationId,
  conversation: initialConversation,
  readOnly = false,
  adminReadOnly = false,
  onReport,
}: {
  conversationId: number;
  conversation?: Conversation | null;
  readOnly?: boolean;
  adminReadOnly?: boolean;
  onReport?: () => void;
}) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(
    initialConversation ?? null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = adminReadOnly
        ? await conversationsService.getAdminConversation(conversationId)
        : await conversationsService.getMessages(conversationId);
      setConversation(data.conversation);
      setMessages(data.messages);
      if (!readOnly && !adminReadOnly) {
        await conversationsService.markRead(conversationId);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [conversationId, readOnly, adminReadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (readOnly || adminReadOnly) return;
    const interval = setInterval(load, POLL_INTERVAL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load, readOnly, adminReadOnly]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await conversationsService.sendMessage(conversationId, { body: trimmed });
      setBody("");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    setReporting(true);
    try {
      await reportsService.create({
        target_type: "conversation",
        target_id: conversationId,
        reason: reportReason.trim(),
        details: reportDetails.trim() || undefined,
      });
      toast.success("Report submitted. Our team will review it.");
      setReportOpen(false);
      setReportReason("");
      setReportDetails("");
      onReport?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setReporting(false);
    }
  };

  const otherName =
    conversation?.other_party?.full_name ??
    (user?.role === "employer" ? "Candidate" : "Employer");
  const subtitle =
    conversation?.job_title ??
    conversation?.application?.job?.title ??
    "Application conversation";

  return (
    <>
      <Card className="border-default bg-surface-card min-h-[420px]">
        <CardContent className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-default pb-4">
            <div>
              <p className="font-semibold text-heading">{otherName}</p>
              <p className="text-subtle text-sm">{subtitle}</p>
            </div>
            {!readOnly ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => setReportOpen(true)}>
                <Flag className="h-4 w-4" />
                Report
              </Button>
            ) : null}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pb-4">
            {loading && messages.length === 0 ? (
              <p className="text-subtle text-sm">Loading messages...</p>
            ) : null}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender_id === user?.id
                    ? "ml-auto bg-[var(--brand-blue)] text-white"
                    : "bg-surface-muted text-heading"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {formatRelativeTime(m.created_at)}
                </p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {!readOnly ? (
            <div className="flex gap-2 border-t border-default pt-4">
              <Input
                placeholder="Type a message..."
                value={body}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              />
              <Button onClick={send} disabled={sending || !body.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report conversation">
        <div className="space-y-4">
          <div>
            <Label htmlFor="report-reason">Reason</Label>
            <Input
              id="report-reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="e.g. Harassment or spam"
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional context for moderators"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button type="button" loading={reporting} onClick={submitReport}>
              Submit report
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
