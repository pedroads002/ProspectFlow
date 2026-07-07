import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type {
  AIProvider,
  DraftMessageContext,
  DraftResult,
} from "../provider.interface";
import { buildFirstContactPrompt, buildFollowUpPrompt } from "../prompts/draft-message";

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
};
