import { z } from "zod";

const optionalText = () =>
  z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined));

/**
 * PRD FR-6: the user's business context — input to every AI draft. Filled once,
 * reused across every future AI task (messages, follow-ups, objections,
 * summaries, proposals, recommendations), not just first-contact drafting.
 */
export const commercialProfileSchema = z.object({
  valueProposition: z
    .string()
    .min(1, { error: "Descreva o que você vende e sua especialidade." }),
  toneDescription: z
    .string()
    .min(1, { error: "Descreva seu tom de comunicação preferido." }),
  servicesOffered: optionalText(),
  targetAudience: optionalText(),
  differentiators: optionalText(),
  commonObjections: optionalText(),
  prohibitedTerms: optionalText(),
  exampleMessage: optionalText(),
});

export type CommercialProfileInput = z.infer<typeof commercialProfileSchema>;
