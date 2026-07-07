import { z } from "zod";

/** PRD FR-6: the user's value proposition, tone, and services — input to every AI draft. */
export const commercialProfileSchema = z.object({
  valueProposition: z
    .string()
    .min(1, { error: "Describe what you sell and your expertise." }),
  toneDescription: z
    .string()
    .min(1, { error: "Describe your preferred communication tone." }),
  servicesOffered: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
});

export type CommercialProfileInput = z.infer<typeof commercialProfileSchema>;
