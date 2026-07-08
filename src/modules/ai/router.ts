import type { AIProvider } from "./provider.interface";
import { anthropicProvider } from "./providers/anthropic.provider";

/**
 * Task → provider/model mapping (ARCHITECTURE.md §4.2). This is the one file
 * that changes to add a provider or rebalance which model handles which task
 * — no calling code should ever import a provider SDK or hardcode a model id.
 *
 * `providerName` is a plain string (not derived from `provider`) purely so
 * AIInteraction audit rows (DATA_MODEL.md §3.8) can record which provider
 * answered without needing to reverse-lookup an object identity.
 *
 * Model ids are env-overridable rather than hardcoded: Anthropic's available
 * model names change over time, and the correct current id depends on the
 * account this runs against. Set ANTHROPIC_DRAFTING_MODEL in .env to match
 * whatever model your account has access to.
 *
 * All four tasks currently route to the same "quality" model — conversation
 * analysis bundles a suggested next message alongside sentiment/objection
 * classification in one call (see prompts/analyze-conversation.ts), and that
 * suggested message needs to sound human, so it isn't split onto a cheaper
 * model the way ARCHITECTURE.md §4.2's table might otherwise suggest. A
 * cheaper model for pure classification is a viable future optimization if
 * cost becomes a concern, not a Sprint 3 requirement.
 */
type TaskConfig = { providerName: string; provider: AIProvider; model: string };

const DEFAULT_QUALITY_MODEL =
  process.env.ANTHROPIC_DRAFTING_MODEL ?? "claude-sonnet-4-5";

type TaskName =
  | "draftFirstContact"
  | "draftFollowUp"
  | "analyzeConversation"
  | "draftProposal";

export const MODEL_ROUTING: Record<TaskName, TaskConfig> = {
  draftFirstContact: {
    providerName: "anthropic",
    provider: anthropicProvider,
    model: DEFAULT_QUALITY_MODEL,
  },
  draftFollowUp: {
    providerName: "anthropic",
    provider: anthropicProvider,
    model: DEFAULT_QUALITY_MODEL,
  },
  analyzeConversation: {
    providerName: "anthropic",
    provider: anthropicProvider,
    model: DEFAULT_QUALITY_MODEL,
  },
  draftProposal: {
    providerName: "anthropic",
    provider: anthropicProvider,
    model: DEFAULT_QUALITY_MODEL,
  },
};
