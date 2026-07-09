import "server-only";
import type { TenantScope } from "@/modules/tenancy/types";
import { manualEntryProvider } from "./lead-source/providers/manual-entry.provider";
import * as leadRepository from "./lead.repository";
import { leadFieldsSchema } from "./lead.schema";
import type { LeadFilters } from "./types";

/**
 * The prospecting module's public surface (CLAUDE.md's module-boundary rule) —
 * other modules and the app/ routes should import only from here, never from
 * lead.repository.ts directly.
 */

export async function createLeadFromManualEntry(
  scope: TenantScope,
  formInput: unknown,
) {
  const [candidate] = await manualEntryProvider.fetchCandidates(formInput);
  return leadRepository.createLead(scope, {
    ...candidate,
    sourceType: manualEntryProvider.sourceType,
  });
}

export function listLeads(scope: TenantScope, filters?: LeadFilters) {
  return leadRepository.listLeads(scope, filters);
}

export function getLead(scope: TenantScope, id: string) {
  return leadRepository.getLead(scope, id);
}

export async function updateLead(
  scope: TenantScope,
  id: string,
  formInput: unknown,
) {
  const data = leadFieldsSchema.parse(formInput);
  return leadRepository.updateLead(scope, id, data);
}

export function deleteLead(scope: TenantScope, id: string) {
  return leadRepository.softDeleteLead(scope, id);
}

export const updateLeadState = leadRepository.updateLeadState;
