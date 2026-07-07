import { LeadSourceType } from "@/generated/prisma/enums";
import { leadFieldsSchema } from "../../lead.schema";
import type { LeadSourceProvider } from "../provider.interface";

/**
 * The MVP's only source (PRD §6, VISION.md's MVP Vision): the user IS the
 * discovery mechanism — each form submission is treated as a single candidate.
 * Future sources (Instagram, Google Maps, directories) implement this same
 * interface without this module or its callers needing to change.
 */
export const manualEntryProvider: LeadSourceProvider = {
  sourceType: LeadSourceType.MANUAL,
  async fetchCandidates(input: unknown) {
    const candidate = leadFieldsSchema.parse(input);
    return [candidate];
  },
};
