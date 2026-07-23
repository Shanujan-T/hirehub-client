"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/shared";
import { EmptyState } from "@/app/_components/page-states";
import { formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/types";

export function ConversationInbox({
  conversations,
  messagesHref = (id) => `/messages/${id}`,
}: {
  conversations: Conversation[];
  messagesHref?: (conversationId: number) => string;
}) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="Start a conversation from an application to message the other party."
      />
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const preview = conversation.last_message?.body ?? "No messages yet";
        const time =
          conversation.last_message?.created_at ?? conversation.created_at ?? null;
        const unread = conversation.unread_count ?? 0;

        return (
          <Link key={conversation.id} href={messagesHref(conversation.id)}>
            <Card className="border-default bg-surface-card card-hover">
              <CardContent className="flex items-start gap-3 p-4">
                <Avatar
                  src={conversation.other_party?.avatar_url}
                  name={conversation.other_party?.full_name ?? "User"}
                  entityId={conversation.other_party?.id}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-heading">
                        {conversation.other_party?.full_name ?? "Conversation"}
                      </p>
                      <p className="text-subtle truncate text-xs">
                        {conversation.job_title ??
                          conversation.application?.job?.title ??
                          "Application"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {time ? (
                        <span className="text-subtle text-[10px]">
                          {formatRelativeTime(time)}
                        </span>
                      ) : null}
                      {unread > 0 ? (
                        <span className="rounded-full bg-[var(--brand-blue)] px-2 py-0.5 text-[10px] font-semibold text-white">
                          {unread}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-subtle mt-1 line-clamp-2 text-sm">{preview}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
