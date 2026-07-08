import "server-only";
import type { TenantScope } from "@/modules/tenancy/types";
import * as prospectingService from "@/modules/prospecting/lead.service";
import * as tenancyService from "@/modules/tenancy/tenancy.service";
import * as conversationService from "@/modules/outreach/conversation.service";
import * as messageService from "@/modules/outreach/message.service";
import * as aiService from "@/modules/ai/ai.service";
import type { Channel } from "@/generated/prisma/enums";

const AI_UNAVAILABLE_MESSAGE =
  "AI assistance is unavailable right now. You can still write a proposal manually.";

/**
 * PRD FR-5.1: an AI-drafted, plain-text proposal grounded in the full Lead +
 * conversation context. The write itself goes through Outreach's generic
 * message creation (`OutboundMessage` with `kind = PROPOSAL`) — Proposals
 * owns the generation, not the table (ARCHITECTURE.md §2's design note).
 */
export async function draftProposal(
  scope: TenantScope,
  leadId: string,
  channel: Channel,
) {
  const lead = await prospectingService.getLead(scope, leadId);
  if (!lead) {
    throw new Error("Lead not found.");
  }

  const profile = await tenancyService.getCommercialProfile(scope);
  if (!profile) {
    throw new Error(
      "Set up your Commercial Profile in Settings before drafting a proposal.",
    );
  }

  const entries = await conversationService.listConversationForLead(scope, leadId);
  const conversationText = entries.length
    ? entries.map((entry) => entry.rawText).join("\n---\n")
    : undefined;

  let content: string;
  try {
    ({ content } = await aiService.draftProposal(scope, leadId, {
      leadName: lead.name,
      niche: lead.niche,
      valueProposition: profile.valueProposition,
      toneDescription: profile.toneDescription,
      conversationText,
    }));
  } catch {
    throw new Error(AI_UNAVAILABLE_MESSAGE);
  }

  return messageService.createDraftMessageRecord(scope, {
    leadId,
    kind: "PROPOSAL",
    channel,
    content,
    aiGenerated: true,
  });
}
