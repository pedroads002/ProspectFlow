import "server-only";
import { MODEL_ROUTING } from "./router";
import type { DraftMessageContext } from "./provider.interface";

export type { DraftMessageContext, DraftResult } from "./provider.interface";

/**
 * The AI module's public surface (CLAUDE.md's module-boundary rule) — other
 * modules call only these functions, never a provider or the SDK directly.
 */

export function draftFirstContactMessage(context: DraftMessageContext) {
  const { provider, model } = MODEL_ROUTING.draftFirstContact;
  return provider.draftFirstContactMessage(context, model);
}

export function draftFollowUpMessage(context: DraftMessageContext) {
  const { provider, model } = MODEL_ROUTING.draftFollowUp;
  return provider.draftFollowUpMessage(context, model);
}
