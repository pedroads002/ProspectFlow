"use server";

import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import {
  upsertCommercialProfile,
  updateUserName,
} from "@/modules/tenancy/tenancy.service";
import { commercialProfileSchema } from "@/modules/tenancy/commercial-profile.schema";
import { userProfileSchema } from "@/modules/tenancy/user-profile.schema";

export type SettingsFormState = { error: string } | { success: true } | undefined;

export async function saveCommercialProfileAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  try {
    const data = commercialProfileSchema.parse({
      valueProposition: formData.get("valueProposition"),
      toneDescription: formData.get("toneDescription"),
      servicesOffered: formData.get("servicesOffered"),
    });
    await upsertCommercialProfile(scope, data);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Dados inválidos." };
    }
    throw error;
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updateUserNameAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { tenant, user } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  try {
    const data = userProfileSchema.parse({ name: formData.get("name") });
    await updateUserName(scope, user.id, data);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Dados inválidos." };
    }
    throw error;
  }

  // The name is displayed on the dashboard greeting and the sidebar too.
  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
