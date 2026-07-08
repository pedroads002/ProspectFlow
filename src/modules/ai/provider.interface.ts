/**
 * Provider-agnostic AI interface (ARCHITECTURE.md §4.1). Sprint 2 added the
 * two drafting methods; Sprint 3 adds conversation analysis and proposal
 * drafting (MVP_BACKLOG.md).
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

export type ConversationAnalysisContext = {
  leadName: string;
  niche: string;
  status: string;
  valueProposition: string;
  toneDescription: string;
  conversationText: string;
};

export type RecommendedNextAction =
  | "CONTINUE_CONVERSATION"
  | "SCHEDULE_MEETING"
  | "SEND_PROPOSAL"
  | "CLOSE_LOST";

/**
 * Every field is optional by design (PRD FR-4.3): the AI includes only what's
 * relevant to the conversation's current stage, never a fixed block of every
 * possible output.
 */
export type ConversationAnalysisResult = {
  summary?: string;
  sentiment?: string;
  objections?: string[];
  suggestedNextMessage?: string;
  suggestedFollowUpStrategy?: string;
  recommendedNextAction?: RecommendedNextAction;
};

export type ProposalContext = {
  leadName: string;
  niche: string;
  valueProposition: string;
  toneDescription: string;
  conversationText?: string;
};

export type ProposalResult = { content: string };

export interface AIProvider {
  draftFirstContactMessage(
    context: DraftMessageContext,
    model: string,
  ): Promise<DraftResult>;
  draftFollowUpMessage(
    context: DraftMessageContext,
    model: string,
  ): Promise<DraftResult>;
  analyzeConversation(
    context: ConversationAnalysisContext,
    model: string,
  ): Promise<ConversationAnalysisResult>;
  draftProposal(context: ProposalContext, model: string): Promise<ProposalResult>;
}
