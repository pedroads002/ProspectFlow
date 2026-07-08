"use server";

import { ZodError } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import * as leadService from "@/modules/prospecting/lead.service";
import { applyQuickAction } from "@/modules/outreach/status.service";
import type { QuickAction } from "@/modules/outreach/types";
import * as messageService from "@/modules/outreach/message.service";
import * as conversationService from "@/modules/outreach/conversation.service";
import * as proposalService from "@/modules/proposals/proposal.service";
import type { Channel } from "@/generated/prisma/enums";
import type { ConversationAnalysisResult } from "@/modules/ai/ai.service";

export type LeadFormState = { error: string } | undefined;

function leadInputFromFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    instagram: formData.get("instagram"),
    whatsapp: formData.get("whatsapp"),
    niche: formData.get("niche"),
    notes: formData.get("notes"),
  };
}

export async function createLeadAction(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  let lead;
  try {
    lead = await leadService.createLeadFromManualEntry(
      scope,
      leadInputFromFormData(formData),
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input." };
    }
    throw error;
  }

  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadAction(
  id: string,
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  try {
    const updated = await leadService.updateLead(
      scope,
      id,
      leadInputFromFormData(formData),
    );
    if (!updated) {
      return { error: "Lead not found." };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input." };
    }
    throw error;
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return undefined;
}

/**
 * Soft-deletes the Lead (PRD FR-1.3, DATA_MODEL.md §6) — permanent from the
 * user's perspective, since every read already filters out `deletedAt`.
 * Idempotent: if the Lead is already gone (or belongs to another tenant),
 * this still redirects to the list rather than erroring.
 */
export async function deleteLeadAction(id: string) {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  await leadService.deleteLead(scope, id);

  revalidatePath("/leads");
  redirect("/leads");
}

/**
 * Applies a Quick Action (PRD §1.2). The UI only ever renders buttons for
 * actions valid from the Lead's current status (status.service's
 * getAvailableQuickActions), so an invalid-transition error here means the
 * client state was stale — letting it surface as an error is fine for that
 * rare race rather than building bespoke recovery for it.
 */
export async function applyQuickActionAction(id: string, action: QuickAction) {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  await applyQuickAction(scope, id, action);

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export type MessageFormState = { error: string } | undefined;

/**
 * Drafts a first-contact message if the Lead is still NEW, otherwise a
 * follow-up (message.service picks based on current status) — PRD FR-2.
 * AI failures (missing profile, provider error) surface as a form error;
 * they never throw an unhandled exception into the UI (ARCHITECTURE.md §4.4).
 */
export async function requestDraftAction(
  leadId: string,
  _prevState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const channel = formData.get("channel") as Channel;
  const lead = await leadService.getLead(scope, leadId);
  if (!lead) {
    return { error: "Lead not found." };
  }

  try {
    if (lead.status === "NEW") {
      await messageService.draftFirstContactMessage(scope, leadId, channel);
    } else {
      await messageService.draftFollowUpMessage(scope, leadId, channel);
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "AI assistance is unavailable right now. You can still write a message manually.",
    };
  }

  revalidatePath(`/leads/${leadId}`);
  return undefined;
}

/**
 * Creates an empty draft with no AI call at all — the manual fallback that
 * keeps the core workflow usable when AI drafting fails or is unavailable
 * (PRD NFR "Reliability", ARCHITECTURE.md §4.4). Offered proactively next to
 * "Generate Draft", not just as error recovery.
 */
export async function createManualDraftAction(
  leadId: string,
  _prevState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const channel = formData.get("channel") as Channel;

  try {
    await messageService.createManualDraft(scope, leadId, channel);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create draft.",
    };
  }

  revalidatePath(`/leads/${leadId}`);
  return undefined;
}

/**
 * Saves the (possibly user-edited) draft content and marks it sent in one
 * step — PRD FR-2.4/FR-2.5. For a first-contact message sent while the Lead
 * is still NEW, this also transitions it to CONTACTED (message.service).
 */
export async function markMessageSentAction(
  messageId: string,
  leadId: string,
  formData: FormData,
) {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const content = formData.get("content");
  if (typeof content === "string" && content.trim()) {
    await messageService.updateDraftContent(scope, messageId, content);
  }
  await messageService.markMessageAsSent(scope, messageId);

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export type PasteConversationFormState = { error: string } | undefined;

/** PRD FR-4.1: paste raw conversation text against a Lead at any time. */
export async function pasteConversationAction(
  leadId: string,
  _prevState: PasteConversationFormState,
  formData: FormData,
): Promise<PasteConversationFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const rawText = formData.get("rawText");
  if (typeof rawText !== "string") {
    return { error: "Paste some conversation text first." };
  }

  try {
    await conversationService.pasteConversation(scope, leadId, rawText);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save conversation.",
    };
  }

  revalidatePath(`/leads/${leadId}`);
  return undefined;
}

/**
 * PRD FR-5.1: an AI-drafted, plain-text proposal from the full Lead +
 * conversation context. Reuses the same MessageFormState/markMessageSentAction
 * lifecycle as any other OutboundMessage — a proposal is one, just with a
 * different kind (DECISIONS.md's Proposals module note).
 */
export async function requestProposalDraftAction(
  leadId: string,
  _prevState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const channel = formData.get("channel") as Channel;

  try {
    await proposalService.draftProposal(scope, leadId, channel);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "AI assistance is unavailable right now. You can still write a proposal manually.",
    };
  }

  revalidatePath(`/leads/${leadId}`);
  return undefined;
}

export type AnalysisFormState =
  | { error: string }
  | { result: ConversationAnalysisResult }
  | undefined;

/**
 * PRD FR-4.2-4.4: one combined, modular AI assistance call. Failures surface
 * as a form error rather than an unhandled exception (ARCHITECTURE.md §4.4).
 */
export async function analyzeConversationAction(
  leadId: string,
  // Required by useActionState's (state, formData) signature; this action needs neither.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: AnalysisFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<AnalysisFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  try {
    const result = await conversationService.analyzeConversation(scope, leadId);
    revalidatePath(`/leads/${leadId}`);
    return { result };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "AI assistance is unavailable right now.",
    };
  }
}
