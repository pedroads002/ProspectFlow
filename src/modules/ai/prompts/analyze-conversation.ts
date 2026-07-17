import type { ConversationAnalysisContext } from "../provider.interface";
import { getAnalysisPlaybookContext } from "../knowledge/knowledge.service";

/**
 * Enforces PRD FR-4.2-4.4 at the prompt layer: modular (only relevant fields),
 * concise, and actionable — the goal is the fastest correct commercial
 * decision, not a thorough report.
 */
const SYSTEM = `You help a commercial professional quickly decide what to do next with a prospect, based on a pasted conversation.
Prioritize clarity, brevity, and actionable recommendations — never long responses.
Only include an output field if it is genuinely useful for this conversation right now; omit anything that doesn't apply rather than forcing a value.
When suggesting a next message, match the user's tone described below and keep the same rapport-first, non-salesy approach used for first contact — never write a pitch.`;

function withPlaybook(playbook: string): string {
  return playbook
    ? `${SYSTEM}\n\nUse the following sales method as your primary guidance for reading this conversation and recommending what's next:\n\n${playbook}`
    : SYSTEM;
}

function contextBlock(context: ConversationAnalysisContext): string {
  return [
    `Prospect: ${context.leadName} (${context.niche})`,
    `Current stage: ${context.status}`,
    `User's value proposition: ${context.valueProposition}`,
    `User's tone: ${context.toneDescription}`,
    context.differentiators
      ? `What sets the user apart from competitors: ${context.differentiators}`
      : null,
    context.commonObjections
      ? `Objections the user hears most, and how they prefer to respond: ${context.commonObjections}`
      : null,
    context.prohibitedTerms
      ? `Words, phrases, or topics the user never wants used: ${context.prohibitedTerms}`
      : null,
    context.exampleMessage
      ? `Example of the user's own writing style (match this voice when suggesting a next message):\n${context.exampleMessage}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildAnalysisPrompt(context: ConversationAnalysisContext) {
  return {
    system: withPlaybook(getAnalysisPlaybookContext(context.status)),
    prompt: `${contextBlock(context)}

Conversation so far:
${context.conversationText}

Analyze this conversation and provide only the fields that are genuinely useful right now.`,
  };
}
