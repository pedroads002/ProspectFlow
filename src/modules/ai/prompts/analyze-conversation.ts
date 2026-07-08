import type { ConversationAnalysisContext } from "../provider.interface";

/**
 * Enforces PRD FR-4.2-4.4 at the prompt layer: modular (only relevant fields),
 * concise, and actionable — the goal is the fastest correct commercial
 * decision, not a thorough report.
 */
const SYSTEM = `You help a commercial professional quickly decide what to do next with a prospect, based on a pasted conversation.
Prioritize clarity, brevity, and actionable recommendations — never long responses.
Only include an output field if it is genuinely useful for this conversation right now; omit anything that doesn't apply rather than forcing a value.
When suggesting a next message, match the user's tone described below and keep the same rapport-first, non-salesy approach used for first contact — never write a pitch.`;

export function buildAnalysisPrompt(context: ConversationAnalysisContext) {
  return {
    system: SYSTEM,
    prompt: `Prospect: ${context.leadName} (${context.niche})
Current stage: ${context.status}
User's value proposition: ${context.valueProposition}
User's tone: ${context.toneDescription}

Conversation so far:
${context.conversationText}

Analyze this conversation and provide only the fields that are genuinely useful right now.`,
  };
}
