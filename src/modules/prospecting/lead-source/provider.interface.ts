import type { LeadSourceType } from "@/generated/prisma/enums";
import type { LeadFieldsInput } from "../lead.schema";

/**
 * A pluggable way to obtain candidate Leads (ARCHITECTURE.md §13, PRD FR-1.5,
 * DECISIONS.md "Why Pluggable Lead-Source Architecture"). Automated sources
 * (Instagram, Google Maps, directories) will implement `fetchCandidates` to
 * discover prospects in bulk from an external source. The MVP ships only the
 * manual-entry provider, where "fetching" just means treating the user's own
 * form submission as a single candidate — see manual-entry.provider.ts.
 */
export interface LeadSourceProvider {
  readonly sourceType: LeadSourceType;
  fetchCandidates(input: unknown): Promise<LeadFieldsInput[]>;
}
