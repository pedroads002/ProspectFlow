import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import type {
  AIProvider,
  ConversationAnalysisContext,
  ConversationAnalysisResult,
  DraftMessageContext,
  DraftResult,
  ProposalContext,
  ProposalResult,
} from "../provider.interface";
import { buildFirstContactPrompt, buildFollowUpPrompt } from "../prompts/draft-message";
import { buildAnalysisPrompt } from "../prompts/analyze-conversation";
import { buildProposalPrompt } from "../prompts/draft-proposal";

/** Mirrors ConversationAnalysisResult — every field optional so the model can omit what isn't relevant (PRD FR-4.3). */
const analysisResultSchema = z.object({
  summary: z.string().optional(),
  sentiment: z.string().optional(),
  objections: z.array(z.string()).optional(),
  suggestedNextMessage: z.string().optional(),
  suggestedFollowUpStrategy: z.string().optional(),
  recommendedNextAction: z
    .enum(["CONTINUE_CONVERSATION", "SCHEDULE_MEETING", "SEND_PROPOSAL", "CLOSE_LOST"])
    .optional(),
});

export const anthropicProvider: AIProvider = {
  async draftFirstContactMessage(
    context: DraftMessageContext,
    model: string,
  ): Promise<DraftResult> {
    const { system, prompt } = buildFirstContactPrompt(context);
    const { text } = await generateText({ model: anthropic(model), system, prompt });
    return { content: text.trim() };
  },

  async draftFollowUpMessage(
    context: DraftMessageContext,
    model: string,
  ): Promise<DraftResult> {
    const { system, prompt } = buildFollowUpPrompt(context);
    const { text } = await generateText({ model: anthropic(model), system, prompt });
    return { content: text.trim() };
  },

  async analyzeConversation(
    context: ConversationAnalysisContext,
    model: string,
  ): Promise<ConversationAnalysisResult> {
    const { system, prompt } = buildAnalysisPrompt(context);
    const { object } = await generateObject({
      model: anthropic(model),
      schema: analysisResultSchema,
      system,
      prompt,
    });
    return object;
  },

  async draftProposal(context: ProposalContext, model: string): Promise<ProposalResult> {
    const { system, prompt } = buildProposalPrompt(context);
    const { text } = await generateText({ model: anthropic(model), system, prompt });
    return { content: text.trim() };
  },
};
