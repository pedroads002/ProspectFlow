import { z } from "zod";

/** PRD FR-6: the user's value proposition, tone, and services — input to every AI draft. */
export const commercialProfileSchema = z.object({
  valueProposition: z
    .string()
    .min(1, { error: "Descreva o que você vende e sua especialidade." }),
  toneDescription: z
    .string()
    .min(1, { error: "Descreva seu tom de comunicação preferido." }),
  servicesOffered: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
});

export type CommercialProfileInput = z.infer<typeof commercialProfileSchema>;
