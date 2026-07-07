/**
 * Provider-agnostic AI interface (ARCHITECTURE.md §4.1). Sprint 2 implements
 * only the two drafting methods; summarizeConversation, analyzeSentiment,
 * suggestNextAction, and draftProposal are added in Sprint 3 when the
 * conversation-assistance and proposal features are built (MVP_BACKLOG.md).
 */

export type DraftMessageContext = {
  leadName: string;
  niche: string;
  instagram?: string;
  whatsapp?: string;
  notes?: string;
  valueProposition: string;
  toneDescription: string;
  /** Prior conversation text, when drafting a follow-up (PRD FR-2.2(d)). */
  priorConversation?: string;
};

export type DraftResult = { content: string };

export interface AIProvider {
  draftFirstContactMessage(
    context: DraftMessageContext,
    model: string,
  ): Promise<DraftResult>;
  draftFollowUpMessage(
    context: DraftMessageContext,
    model: string,
  ): Promise<DraftResult>;
}
