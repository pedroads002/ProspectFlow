import type { ProposalContext } from "../provider.interface";

/** Enforces PRD FR-5.1/FR-5.4: plain-text, conversation-grounded, no invented commitments. */
const SYSTEM = `You help a commercial professional draft a plain-text proposal message for a prospect who is ready for one.
Reference specifics from the conversation and the user's value proposition. Keep it concise and in the user's tone — this is still a message, not a formal document.
Never invent pricing, scope, or commitments the user hasn't described.`;

export function buildProposalPrompt(context: ProposalContext) {
  const conversationBlock = context.conversationText
    ? `\nConversation so far:\n${context.conversationText}\n`
    : "";

  return {
    system: SYSTEM,
    prompt: `Prospect: ${context.leadName} (${context.niche})
User's value proposition: ${context.valueProposition}
User's tone: ${context.toneDescription}
${conversationBlock}
Draft a proposal message for this prospect.`,
  };
}
