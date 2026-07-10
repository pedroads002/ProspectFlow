import { z } from "zod";

/** The individual person's display name (User.name) — distinct from CommercialProfile. */
export const userProfileSchema = z.object({
  name: z.string().min(1, { error: "Informe seu nome." }),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
