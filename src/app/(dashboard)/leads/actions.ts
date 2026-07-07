"use server";

import { ZodError } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import * as leadService from "@/modules/prospecting/lead.service";

export type LeadFormState = { error: string } | undefined;

function leadInputFromFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    instagram: formData.get("instagram"),
    whatsapp: formData.get("whatsapp"),
    niche: formData.get("niche"),
    notes: formData.get("notes"),
  };
}

export async function createLeadAction(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  let lead;
  try {
    lead = await leadService.createLeadFromManualEntry(
      scope,
      leadInputFromFormData(formData),
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input." };
    }
    throw error;
  }

  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadAction(
  id: string,
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  try {
    const updated = await leadService.updateLead(
      scope,
      id,
      leadInputFromFormData(formData),
    );
    if (!updated) {
      return { error: "Lead not found." };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Invalid input." };
    }
    throw error;
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return undefined;
}

/**
 * Soft-deletes the Lead (PRD FR-1.3, DATA_MODEL.md §6) — permanent from the
 * user's perspective, since every read already filters out `deletedAt`.
 * Idempotent: if the Lead is already gone (or belongs to another tenant),
 * this still redirects to the list rather than erroring.
 */
export async function deleteLeadAction(id: string) {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  await leadService.deleteLead(scope, id);

  revalidatePath("/leads");
  redirect("/leads");
}
