import type { DraftMessageContext } from "../provider.interface";
import {
  getFirstContactPlaybookContext,
  getFollowUpPlaybookContext,
} from "../knowledge/knowledge.service";

/**
 * Enforces PRD FR-2.3 at the prompt layer, not just as a tuning preference:
 * the goal is rapport/curiosity, never a pitch, and output must stay brief
 * (ARCHITECTURE.md §4.3's response-shaping responsibility). This guardrail is
 * a fixed product guarantee — it holds regardless of what the sales playbook
 * below says (DECISIONS.md "Why the Sales Playbook Is File-Based").
 */
const SHARED_SYSTEM = `You help a commercial professional draft outbound WhatsApp/Instagram messages to prospects.
Your goal is to open a natural conversation and build rapport and curiosity — never to pitch, sell, or sound like a marketing agency.
Write in the user's own tone, described below. Keep messages short, concise, and human — a few sentences at most, never a long message.
Never include pricing, calls-to-action to buy, or generic sales language.`;

/** Appends the task-relevant slice of the user's sales playbook, when filled in. */
function withPlaybook(playbook: string): string {
  return playbook
    ? `${SHARED_SYSTEM}\n\nUse the following sales method as your primary guidance for how to approach this:\n\n${playbook}`
    : SHARED_SYSTEM;
}

function contextBlock(context: DraftMessageContext): string {
  return [
    `Prospect name: ${context.leadName}`,
    `Niche: ${context.niche}`,
    context.instagram ? `Instagram: ${context.instagram}` : null,
    context.notes ? `Notes about the prospect: ${context.notes}` : null,
    `User's value proposition / expertise: ${context.valueProposition}`,
    `User's preferred communication tone: ${context.toneDescription}`,
    context.targetAudience ? `User's ideal target audience: ${context.targetAudience}` : null,
    context.prohibitedTerms
      ? `Words, phrases, or topics the user never wants used: ${context.prohibitedTerms}`
      : null,
    context.exampleMessage
      ? `Example of the user's own writing style (match this voice):\n${context.exampleMessage}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildFirstContactPrompt(context: DraftMessageContext) {
  return {
    system: withPlaybook(getFirstContactPlaybookContext()),
    prompt: `${contextBlock(context)}

Draft a first-contact message to this prospect, referencing something specific to them, following the tone described above.`,
  };
}

export function buildFollowUpPrompt(context: DraftMessageContext) {
  const priorConversationBlock = context.priorConversation
    ? `\nPrior conversation:\n${context.priorConversation}\n`
    : "";

  return {
    system: withPlaybook(getFollowUpPlaybookContext()),
    prompt: `${contextBlock(context)}
${priorConversationBlock}
Draft a natural follow-up message continuing this relationship, in the same tone.`,
  };
}
