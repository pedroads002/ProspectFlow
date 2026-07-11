import "server-only";
import { getDayRange } from "@/lib/utils";
import * as messageRepository from "./message.repository";
import * as leadEventRepository from "./lead-event.repository";
import type { TenantScope } from "@/modules/tenancy/types";

export type DailySummary = {
  messagesSent: number;
  conversationsStarted: number;
  replies: number;
  followUps: number;
  meetingsScheduled: number;
};

/**
 * Powers the Painel do Dia (WORKFLOW.md §3.1, §4) — every counter is a query
 * over `OutboundMessage`/`LeadEvent` that already exist, tenant-scoped, cut to
 * the current calendar day. No new persisted field; recomputed on every read.
 */
export async function getDailySummary(
  scope: TenantScope,
  date: Date = new Date(),
): Promise<DailySummary> {
  const range = getDayRange(date);

  const [messagesSent, conversationsStarted, replies, followUps, meetingsScheduled] =
    await Promise.all([
      messageRepository.countSentInRange(scope, range),
      messageRepository.countSentInRange(scope, { ...range, kind: "FIRST_CONTACT" }),
      leadEventRepository.countEventsInRange(scope, {
        ...range,
        type: "STATUS_CHANGED",
        toStatus: "REPLIED",
      }),
      leadEventRepository.countEventsInRange(scope, {
        ...range,
        type: "FOLLOW_UP_LOGGED",
      }),
      leadEventRepository.countEventsInRange(scope, {
        ...range,
        type: "STATUS_CHANGED",
        toStatus: "NEGOTIATION",
      }),
    ]);

  return { messagesSent, conversationsStarted, replies, followUps, meetingsScheduled };
}
