import "server-only";
import { MODEL_ROUTING } from "./router";
import * as aiInteractionRepository from "./ai-interaction.repository";
import type { TenantScope } from "@/modules/tenancy/types";
import type {
  DraftMessageContext,
  ConversationAnalysisContext,
  ConversationAnalysisResult,
  ProposalContext,
} from "./provider.interface";

export type {
  DraftMessageContext,
  DraftResult,
  ConversationAnalysisContext,
  ConversationAnalysisResult,
  RecommendedNextAction,
  ProposalContext,
  ProposalResult,
} from "./provider.interface";

/**
 * The AI module's public surface (CLAUDE.md's module-boundary rule) — other
 * modules call only these functions, never a provider or the SDK directly.
 * Every call is logged to AIInteraction here, in one place, so no caller can
 * forget to record one (DATA_MODEL.md §3.8).
 */

export async function draftFirstContactMessage(
  scope: TenantScope,
  leadId: string,
  context: DraftMessageContext,
) {
  const { provider, providerName, model } = MODEL_ROUTING.draftFirstContact;
  const result = await provider.draftFirstContactMessage(context, model);

  await aiInteractionRepository.logInteraction(scope, {
    leadId,
    taskType: "DRAFT_FIRST_CONTACT",
    provider: providerName,
    model,
    inputSnapshot: JSON.stringify(context),
    outputContent: result.content,
  });

  return result;
}

export async function draftFollowUpMessage(
  scope: TenantScope,
  leadId: string,
  context: DraftMessageContext,
) {
  const { provider, providerName, model } = MODEL_ROUTING.draftFollowUp;
  const result = await provider.draftFollowUpMessage(context, model);

  await aiInteractionRepository.logInteraction(scope, {
    leadId,
    taskType: "DRAFT_FOLLOW_UP",
    provider: providerName,
    model,
    inputSnapshot: JSON.stringify(context),
    outputContent: result.content,
  });

  return result;
}

/**
 * One combined call produces every modular field (PRD FR-4.2 lists them as
 * the possible outputs of a single "AI assistance" request, not six separate
 * calls). AITaskType only distinguishes SUMMARIZE/SENTIMENT/NEXT_ACTION, so
 * the audit row is tagged by whichever is most representative of what came
 * back — this is a bookkeeping label, not a behavioral distinction.
 */
function primaryTaskTypeFor(result: ConversationAnalysisResult) {
  if (result.summary) return "SUMMARIZE" as const;
  if (result.recommendedNextAction) return "NEXT_ACTION" as const;
  if (result.sentiment || result.objections?.length) return "SENTIMENT" as const;
  return "SUMMARIZE" as const;
}

export async function analyzeConversation(
  scope: TenantScope,
  leadId: string,
  context: ConversationAnalysisContext,
) {
  const { provider, providerName, model } = MODEL_ROUTING.analyzeConversation;
  const result = await provider.analyzeConversation(context, model);

  await aiInteractionRepository.logInteraction(scope, {
    leadId,
    taskType: primaryTaskTypeFor(result),
    provider: providerName,
    model,
    inputSnapshot: JSON.stringify(context),
    outputContent: JSON.stringify(result),
  });

  return result;
}

export async function draftProposal(
  scope: TenantScope,
  leadId: string,
  context: ProposalContext,
) {
  const { provider, providerName, model } = MODEL_ROUTING.draftProposal;
  const result = await provider.draftProposal(context, model);

  await aiInteractionRepository.logInteraction(scope, {
    leadId,
    taskType: "PROPOSAL_DRAFT",
    provider: providerName,
    model,
    inputSnapshot: JSON.stringify(context),
    outputContent: result.content,
  });

  return result;
}
