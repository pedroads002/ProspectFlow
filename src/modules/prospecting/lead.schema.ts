import { z } from "zod";

const INSTAGRAM_URL_PATTERN = /^(https?:\/\/)?(www\.)?instagram\.com\//i;

/** Accepts `@handle`, `handle`, or a full profile URL; stores a bare handle. */
function normalizeInstagram(value: string) {
  return value
    .replace(INSTAGRAM_URL_PATTERN, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/^@/, "")
    .trim();
}

/**
 * Validates the public, prospect-facing fields (PRD §1.3) shared by every
 * creation path (manual entry today, future automated sources) and by edits.
 */
export const leadFieldsSchema = z
  .object({
    name: z.string().min(1, { error: "Nome é obrigatório." }),
    instagram: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? normalizeInstagram(value) : undefined)),
    followerCount: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? value.trim() : undefined))
      .transform((value) => (value === undefined ? undefined : Number(value)))
      .refine(
        (value) => value === undefined || (Number.isInteger(value) && value >= 0),
        { error: "Quantidade de seguidores deve ser um número inteiro positivo." },
      ),
    whatsapp: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? value.trim() : undefined)),
    // Displayed as "Especialidade" in the UI — same field/values, only the label differs.
    niche: z.string().min(1, { error: "Especialidade é obrigatória." }),
    notes: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? value.trim() : undefined)),
  })
  .refine((data) => Boolean(data.instagram || data.whatsapp), {
    error: "Informe pelo menos um contato: Instagram ou WhatsApp.",
    path: ["instagram"],
  });

export type LeadFieldsInput = z.infer<typeof leadFieldsSchema>;
