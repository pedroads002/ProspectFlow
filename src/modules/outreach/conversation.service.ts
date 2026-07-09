import "server-only";
import type { TenantScope } from "@/modules/tenancy/types";
import * as prospectingService from "@/modules/prospecting/lead.service";
import * as tenancyService from "@/modules/tenancy/tenancy.service";
import * as aiService from "@/modules/ai/ai.service";
import * as conversationEntryRepository from "./conversation-entry.repository";
import * as leadEventRepository from "./lead-event.repository";

/** PRD FR-4.1: the user can paste raw conversation text against a Lead at any time. */
export async function pasteConversation(
  scope: TenantScope,
  leadId: string,
  rawText: string,
) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("Cole o texto da conversa primeiro.");
  }

  const lead = await prospectingService.getLead(scope, leadId);
  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  const entry = await conversationEntryRepository.createEntry(scope, leadId, trimmed);

  await leadEventRepository.logEvent(scope, { leadId, type: "CONVERSATION_PASTED" });

  return entry;
}

export function listConversationForLead(scope: TenantScope, leadId: string) {
  return conversationEntryRepository.listEntriesForLead(scope, leadId);
}

const AI_UNAVAILABLE_MESSAGE = "A assistência de IA está indisponível no momento.";

/**
 * Gathers every pasted entry for continuity (PRD FR-2.2(d)), calls the AI
 * module's combined, modular analysis (FR-4.2/4.3), and logs the request as
 * a LeadEvent for the Lead's timeline.
 */
export async function analyzeConversation(scope: TenantScope, leadId: string) {
  const lead = await prospectingService.getLead(scope, leadId);
  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  const profile = await tenancyService.getCommercialProfile(scope);
  if (!profile) {
    throw new Error(
      "Configure seu Perfil Comercial em Configurações antes de solicitar assistência de IA.",
    );
  }

  const entries = await conversationEntryRepository.listEntriesForLead(scope, leadId);
  if (entries.length === 0) {
    throw new Error("Cole uma conversa primeiro.");
  }

  const conversationText = entries.map((entry) => entry.rawText).join("\n---\n");

  let result;
  try {
    result = await aiService.analyzeConversation(scope, leadId, {
      leadName: lead.name,
      niche: lead.niche,
      status: lead.status,
      valueProposition: profile.valueProposition,
      toneDescription: profile.toneDescription,
      conversationText,
    });
  } catch {
    throw new Error(AI_UNAVAILABLE_MESSAGE);
  }

  await leadEventRepository.logEvent(scope, { leadId, type: "AI_ASSISTANCE_REQUESTED" });

  return result;
}
