import "server-only";
import type { LeadEvent, OutboundMessage, ConversationEntry } from "@/generated/prisma/client";
import type { TenantScope } from "@/modules/tenancy/types";
import * as leadEventRepository from "./lead-event.repository";
import * as messageRepository from "./message.repository";
import * as conversationEntryRepository from "./conversation-entry.repository";

export type TimelineItem =
  | { type: "EVENT"; timestamp: Date; event: LeadEvent }
  | { type: "MESSAGE"; timestamp: Date; message: OutboundMessage }
  | { type: "CONVERSATION"; timestamp: Date; entry: ConversationEntry };

/**
 * Merges LeadEvent + OutboundMessage + ConversationEntry into one
 * chronological history (MVP_BACKLOG.md Sprint 3 DoD: "tells a complete,
 * readable story of a Lead's history from a single screen"). Most-recent-first,
 * matching the rest of the UI's convention (Lead list, message panels).
 */
export async function getLeadTimeline(
  scope: TenantScope,
  leadId: string,
): Promise<TimelineItem[]> {
  const [events, messages, entries] = await Promise.all([
    leadEventRepository.listEvents(scope, leadId),
    messageRepository.listMessagesForLead(scope, leadId),
    conversationEntryRepository.listEntriesForLead(scope, leadId),
  ]);

  const items: TimelineItem[] = [
    ...events.map((event) => ({ type: "EVENT" as const, timestamp: event.createdAt, event })),
    ...messages.map((message) => ({
      type: "MESSAGE" as const,
      timestamp: message.createdAt,
      message,
    })),
    ...entries.map((entry) => ({
      type: "CONVERSATION" as const,
      timestamp: entry.pastedAt,
      entry,
    })),
  ];

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
