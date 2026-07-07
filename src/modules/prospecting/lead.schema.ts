import { z } from "zod";

/**
 * Validates the public, prospect-facing fields (PRD §1.3) shared by every
 * creation path (manual entry today, future automated sources) and by edits.
 */
export const leadFieldsSchema = z.object({
  name: z.string().min(1, { error: "Name is required." }),
  instagram: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  whatsapp: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
  niche: z.string().min(1, { error: "Niche is required." }),
  notes: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined)),
});

export type LeadFieldsInput = z.infer<typeof leadFieldsSchema>;
