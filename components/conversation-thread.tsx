"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, MoreVertical, Paperclip, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PortaledPopover } from "@/components/ui/portaled-popover";
import { Label } from "@/components/ui/form";
import { Textarea } from "@/components/ui/card";
import conversationsService from "@/services/conversations";
import reportsService from "@/services/reports";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn, formatClockTime, formatRelativeTime, parseApiDate, resolveMediaUrl } from "@/lib/utils";
import type { Conversation, Message } from "@/types";

const POLL_INTERVAL_MS = 12000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const GROUP_WINDOW_MS = 2 * 60 * 1000;
const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function messageTime(value: string | null | undefined): number {
  return parseApiDate(value)?.getTime() ?? 0;
}

function isSameGroup(a: Message, b: Message | undefined): boolean {
  if (!b || a.sender_id !== b.sender_id) return false;
  return Math.abs(messageTime(a.created_at) - messageTime(b.created_at)) < GROUP_WINDOW_MS;
}

function isMessageSeen(
  message: Message,
  otherLastReadAt: string | null | undefined,
): boolean {
  const watermark = otherLastReadAt || message.read_at;
  if (!watermark) return false;
  if (otherLastReadAt) {
    return messageTime(otherLastReadAt) >= messageTime(message.created_at);
  }
  return Boolean(message.read_at);
}

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
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [deleteEveryoneId, setDeleteEveryoneId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const menuAnchorRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef(0);

  const closeMenu = useCallback(() => setMenuOpenId(null), []);

  const scrollListToBottom = useCallback((smooth = false) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const clearPendingImage = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingImage(null);
    setPendingPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    const grew = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;
    scrollListToBottom(grew && !loading);
  }, [messages, loading, scrollListToBottom]);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
      toast.error("Image must be JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingImage(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed && !pendingImage) return;
    setSending(true);
    try {
      await conversationsService.sendMessage(conversationId, {
        body: trimmed || undefined,
        image: pendingImage,
      });
      setBody("");
      clearPendingImage();
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const deleteForMe = async (messageId: number) => {
    setMenuOpenId(null);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await conversationsService.deleteMessage(messageId, "me");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      await load();
    }
  };

  const confirmDeleteEveryone = async () => {
    if (deleteEveryoneId == null) return;
    const id = deleteEveryoneId;
    setDeleting(true);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDeleteEveryoneId(null);
    setMenuOpenId(null);
    try {
      await conversationsService.deleteMessage(id, "everyone");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      await load();
    } finally {
      setDeleting(false);
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
    conversation?.context === "connection"
      ? "Connection"
      : conversation?.job_title
        ? `Re: ${conversation.job_title}`
        : conversation?.application?.job?.title
          ? `Re: ${conversation.application.job.title}`
          : "Conversation";

  let lastMineId: number | null = null;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].sender_id === user?.id) {
      lastMineId = messages[i].id;
      break;
    }
  }
  const otherLastReadAt = conversation?.other_last_read_at;

  return (
    <>
      <Card className="border-default bg-surface-card overflow-hidden">
        <CardContent className="flex h-[min(70vh,560px)] flex-col overflow-x-hidden p-0">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-default px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-heading">{otherName}</p>
              <p className="text-subtle truncate text-sm">{subtitle}</p>
            </div>
            {!readOnly ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => setReportOpen(true)}>
                <Flag className="h-4 w-4" />
                Report
              </Button>
            ) : null}
          </div>

          <div
            ref={listRef}
            className="message-list slim-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3"
          >
            <div className="flex min-h-full w-full max-w-full flex-col justify-end">
              {loading && messages.length === 0 ? (
                <p className="text-subtle py-6 text-center text-sm">Loading messages...</p>
              ) : null}
              {messages.map((m, index) => {
                const mine = m.sender_id === user?.id;
                const prev = messages[index - 1];
                const next = messages[index + 1];
                const groupedWithPrev = isSameGroup(m, prev);
                const showTime = !isSameGroup(m, next);
                const imageSrc = resolveMediaUrl(m.attachment_url);
                const showSeen =
                  mine &&
                  m.id === lastMineId &&
                  !readOnly &&
                  !adminReadOnly &&
                  isMessageSeen(m, otherLastReadAt);
                const seenClock = formatClockTime(
                  otherLastReadAt || m.read_at,
                );

                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex w-full max-w-full",
                      mine ? "justify-end" : "justify-start",
                      groupedWithPrev ? "mt-0.5" : "mt-3",
                    )}
                  >
                    <div
                      className={cn(
                        "flex max-w-[min(65%,20rem)] min-w-0 flex-col sm:max-w-md",
                        mine ? "items-end" : "items-start",
                      )}
                    >
                    <div
                      className={cn(
                        "group relative w-full min-w-0 px-3 py-2 text-sm shadow-sm",
                        mine
                          ? cn(
                              "bg-[var(--brand-blue)] text-white",
                              groupedWithPrev
                                ? "rounded-2xl rounded-br-md"
                                : "rounded-2xl rounded-br-sm",
                            )
                          : cn(
                              "bg-gray-100 text-heading dark:bg-gray-800 dark:text-heading",
                              groupedWithPrev
                                ? "rounded-2xl rounded-bl-md"
                                : "rounded-2xl rounded-bl-sm",
                            ),
                      )}
                    >
                      {!readOnly && !adminReadOnly ? (
                        <div
                          className={cn(
                            "absolute top-0.5 z-10 transition-opacity focus-within:opacity-100",
                            menuOpenId === m.id
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100",
                            mine ? "-left-8" : "-right-8",
                          )}
                        >
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-card text-subtle shadow-sm ring-1 ring-default hover:text-heading"
                            aria-label="Message options"
                            aria-expanded={menuOpenId === m.id}
                            aria-haspopup="menu"
                            onClick={(event) => {
                              const next =
                                menuOpenId === m.id ? null : m.id;
                              menuAnchorRef.current =
                                next == null ? null : event.currentTarget;
                              setMenuOpenId(next);
                            }}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}

                      {imageSrc ? (
                        <button
                          type="button"
                          className="mb-1 block overflow-hidden rounded-lg"
                          onClick={() => setLightboxSrc(imageSrc)}
                          aria-label="Expand image"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageSrc}
                            alt=""
                            className="max-h-60 max-w-[240px] object-contain"
                          />
                        </button>
                      ) : null}

                      {m.body ? (
                        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {m.body}
                        </p>
                      ) : null}

                      {showTime ? (
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            mine ? "text-right text-white/70" : "text-subtle",
                          )}
                        >
                          {formatRelativeTime(m.created_at)}
                        </p>
                      ) : null}
                    </div>
                    {showSeen ? (
                      <p className="text-subtle mt-0.5 px-1 text-[10px]">
                        {seenClock ? `Seen ${seenClock}` : "Seen"}
                      </p>
                    ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!readOnly ? (
            <div className="shrink-0 border-t border-default px-3 py-3">
              {pendingPreview ? (
                <div className="mb-2 flex items-start gap-2">
                  <div className="relative overflow-hidden rounded-lg border border-default">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingPreview}
                      alt="Attachment preview"
                      className="h-16 w-16 object-contain bg-surface-muted"
                    />
                    <button
                      type="button"
                      className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      onClick={clearPendingImage}
                      aria-label="Remove attachment"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-subtle truncate text-xs">{pendingImage?.name}</p>
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_IMAGES}
                  className="hidden"
                  onChange={(e) => onPickImage(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 shrink-0 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach image"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={body}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
                  className="min-w-0 flex-1 rounded-full"
                />
                <Button
                  onClick={() => void send()}
                  disabled={sending || (!body.trim() && !pendingImage)}
                  className="h-10 w-10 shrink-0 rounded-full p-0"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <PortaledPopover
        open={menuOpenId != null}
        onClose={closeMenu}
        anchorRef={menuAnchorRef}
        align={
          messages.find((m) => m.id === menuOpenId)?.sender_id === user?.id
            ? "start"
            : "end"
        }
        className="min-w-[10.5rem] rounded-xl border border-default bg-surface-card py-1 shadow-lg"
        aria-label="Message options"
      >
        {menuOpenId != null ? (
          <>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-heading hover:bg-surface-muted"
              onClick={() => void deleteForMe(menuOpenId)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete for me
            </button>
            {messages.find((m) => m.id === menuOpenId)?.sender_id ===
            user?.id ? (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#DA3753] hover:bg-surface-muted"
                onClick={() => {
                  closeMenu();
                  setDeleteEveryoneId(menuOpenId);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete for everyone
              </button>
            ) : null}
          </>
        ) : null}
      </PortaledPopover>

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

      <Modal
        open={deleteEveryoneId != null}
        onClose={() => setDeleteEveryoneId(null)}
        title="Delete for everyone"
      >
        <div className="space-y-4">
          <p className="text-subtle text-sm">
            Delete this message for everyone? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteEveryoneId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              loading={deleting}
              onClick={() => void confirmDeleteEveryone()}
            >
              Delete for everyone
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(lightboxSrc)} onClose={() => setLightboxSrc(null)} size="lg" title="Image">
        {lightboxSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lightboxSrc}
            alt="Message attachment"
            className="max-h-[70vh] w-full rounded-xl object-contain"
          />
        ) : null}
      </Modal>
    </>
  );
}
