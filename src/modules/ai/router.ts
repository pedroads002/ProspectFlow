import type { AIProvider } from "./provider.interface";
import { anthropicProvider } from "./providers/anthropic.provider";

/**
 * Task → provider/model mapping (ARCHITECTURE.md §4.2). This is the one file
 * that changes to add a provider or rebalance which model handles which task
 * — no calling code should ever import a provider SDK or hardcode a model id.
 *
 * Model ids are env-overridable rather than hardcoded: Anthropic's available
 * model names change over time, and the correct current id depends on the
 * account this runs against. Set ANTHROPIC_DRAFTING_MODEL in .env to match
 * whatever model your account has access to.
 */
type TaskConfig = { provider: AIProvider; model: string };

const DEFAULT_DRAFTING_MODEL =
  process.env.ANTHROPIC_DRAFTING_MODEL ?? "claude-sonnet-4-5";

export const MODEL_ROUTING: Record<"draftFirstContact" | "draftFollowUp", TaskConfig> = {
  draftFirstContact: { provider: anthropicProvider, model: DEFAULT_DRAFTING_MODEL },
  draftFollowUp: { provider: anthropicProvider, model: DEFAULT_DRAFTING_MODEL },
};
