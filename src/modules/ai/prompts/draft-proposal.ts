import type { ProposalContext } from "../provider.interface";

/** Enforces PRD FR-5.1/FR-5.4: plain-text, conversation-grounded, no invented commitments. */
const SYSTEM = `You help a commercial professional draft a plain-text proposal message for a prospect who is ready for one.
Reference specifics from the conversation and the user's value proposition. Keep it concise and in the user's tone — this is still a message, not a formal document.
Never invent pricing, scope, or commitments the user hasn't described.`;

function contextBlock(context: ProposalContext): string {
  return [
    `Prospect: ${context.leadName} (${context.niche})`,
    `User's value proposition: ${context.valueProposition}`,
    `User's tone: ${context.toneDescription}`,
    context.targetAudience ? `User's ideal target audience: ${context.targetAudience}` : null,
    context.differentiators
      ? `What sets the user apart from competitors: ${context.differentiators}`
      : null,
    context.commonObjections
      ? `Objections the user hears most, and how they prefer to respond: ${context.commonObjections}`
      : null,
    context.prohibitedTerms
      ? `Words, phrases, or topics the user never wants used: ${context.prohibitedTerms}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildProposalPrompt(context: ProposalContext) {
  const conversationBlock = context.conversationText
    ? `\nConversation so far:\n${context.conversationText}\n`
    : "";

  return {
    system: SYSTEM,
    prompt: `${contextBlock(context)}
${conversationBlock}
Draft a proposal message for this prospect.`,
  };
}
