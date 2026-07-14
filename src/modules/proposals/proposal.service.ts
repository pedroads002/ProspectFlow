import "server-only";
import type { TenantScope } from "@/modules/tenancy/types";
import * as prospectingService from "@/modules/prospecting/lead.service";
import * as tenancyService from "@/modules/tenancy/tenancy.service";
import * as conversationService from "@/modules/outreach/conversation.service";
import * as messageService from "@/modules/outreach/message.service";
import * as aiService from "@/modules/ai/ai.service";
import type { Channel } from "@/generated/prisma/enums";

const AI_UNAVAILABLE_MESSAGE =
  "A assistência de IA está indisponível no momento. Você ainda pode escrever a proposta manualmente.";

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
    throw new Error("Lead não encontrado.");
  }

  const profile = await tenancyService.getCommercialProfile(scope);
  if (!profile) {
    throw new Error(
      "Configure seu Perfil Comercial em Configurações antes de gerar uma proposta.",
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
      targetAudience: profile.targetAudience ?? undefined,
      differentiators: profile.differentiators ?? undefined,
      commonObjections: profile.commonObjections ?? undefined,
      prohibitedTerms: profile.prohibitedTerms ?? undefined,
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
