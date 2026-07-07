import "server-only";
import type { TenantScope } from "@/modules/tenancy/types";
import * as prospectingService from "@/modules/prospecting/lead.service";
import * as tenancyService from "@/modules/tenancy/tenancy.service";
import * as aiService from "@/modules/ai/ai.service";
import * as messageRepository from "./message.repository";
import * as leadEventRepository from "./lead-event.repository";
import * as momentumService from "./momentum.service";
import type { Channel } from "@/generated/prisma/enums";

/** Gathers the personalization inputs PRD FR-2.2 requires: Lead public info + Commercial Profile. */
async function buildDraftContext(
  scope: TenantScope,
  leadId: string,
  priorConversation?: string,
) {
  const lead = await prospectingService.getLead(scope, leadId);
  if (!lead) {
    throw new Error("Lead not found.");
  }

  const profile = await tenancyService.getCommercialProfile(scope);
  if (!profile) {
    throw new Error(
      "Set up your Commercial Profile in Settings before drafting messages.",
    );
  }

  return {
    leadName: lead.name,
    niche: lead.niche,
    instagram: lead.instagram ?? undefined,
    whatsapp: lead.whatsapp ?? undefined,
    notes: lead.notes ?? undefined,
    valueProposition: profile.valueProposition,
    toneDescription: profile.toneDescription,
    priorConversation,
  };
}

/**
 * Normalizes any AI provider/network failure to one friendly message
 * (ARCHITECTURE.md §4.4) — precondition errors from buildDraftContext (missing
 * Lead, missing Commercial Profile) are left to propagate as-is, since those
 * are actionable and specific, unlike a raw provider error.
 */
const AI_UNAVAILABLE_MESSAGE =
  "AI assistance is unavailable right now. You can still write a message manually.";

export async function draftFirstContactMessage(
  scope: TenantScope,
  leadId: string,
  channel: Channel,
) {
  const context = await buildDraftContext(scope, leadId);

  let content: string;
  try {
    ({ content } = await aiService.draftFirstContactMessage(context));
  } catch {
    throw new Error(AI_UNAVAILABLE_MESSAGE);
  }

  return messageRepository.createDraftMessage(scope, {
    leadId,
    kind: "FIRST_CONTACT",
    channel,
    content,
    aiGenerated: true,
  });
}

export async function draftFollowUpMessage(
  scope: TenantScope,
  leadId: string,
  channel: Channel,
  priorConversation?: string,
) {
  const context = await buildDraftContext(scope, leadId, priorConversation);

  let content: string;
  try {
    ({ content } = await aiService.draftFollowUpMessage(context));
  } catch {
    throw new Error(AI_UNAVAILABLE_MESSAGE);
  }

  return messageRepository.createDraftMessage(scope, {
    leadId,
    kind: "FOLLOW_UP",
    channel,
    content,
    aiGenerated: true,
  });
}

/**
 * Lets the user write a message from scratch, with no AI call at all — the
 * manual fallback that keeps the core workflow usable when AI drafting fails
 * or is unavailable (PRD NFR "Reliability", ARCHITECTURE.md §4.4).
 */
export async function createManualDraft(
  scope: TenantScope,
  leadId: string,
  channel: Channel,
) {
  const lead = await prospectingService.getLead(scope, leadId);
  if (!lead) {
    throw new Error("Lead not found.");
  }

  return messageRepository.createDraftMessage(scope, {
    leadId,
    kind: lead.status === "NEW" ? "FIRST_CONTACT" : "FOLLOW_UP",
    channel,
    content: "",
    aiGenerated: false,
  });
}

export function updateDraftContent(
  scope: TenantScope,
  messageId: string,
  content: string,
) {
  return messageRepository.updateMessageContent(scope, messageId, content);
}

export function listMessagesForLead(scope: TenantScope, leadId: string) {
  return messageRepository.listMessagesForLead(scope, leadId);
}

/**
 * Marking a message sent is the explicit, deliberate action distinct from
 * drafting (PRD business rule #3 — a draft is never auto-submitted). For a
 * FIRST_CONTACT message sent while the Lead is still NEW, this is also what
 * transitions it to CONTACTED (PRD §7.1) — guarded on the Lead's current
 * status so re-sending a stray draft can never regress a Lead that has
 * already moved forward.
 */
export async function markMessageAsSent(scope: TenantScope, messageId: string) {
  const message = await messageRepository.getMessage(scope, messageId);
  if (!message) return null;

  const sent = await messageRepository.markMessageSent(scope, messageId);
  if (!sent) return null;

  const lead = await prospectingService.getLead(scope, message.leadId);
  const shouldTransitionToContacted =
    message.kind === "FIRST_CONTACT" && lead?.status === "NEW";

  await leadEventRepository.logEvent(scope, {
    leadId: message.leadId,
    type: "MESSAGE_SENT",
    ...(shouldTransitionToContacted
      ? { fromStatus: "NEW" as const, toStatus: "CONTACTED" as const }
      : {}),
  });

  const updatedLead = await prospectingService.updateLeadState(scope, message.leadId, {
    ...(shouldTransitionToContacted ? { status: "CONTACTED" as const } : {}),
    lastActivityAt: new Date(),
  });
  if (updatedLead) {
    await momentumService.refreshLeadMomentum(scope, updatedLead);
  }

  return sent;
}
