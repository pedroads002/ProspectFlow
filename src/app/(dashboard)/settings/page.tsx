import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { getCommercialProfile } from "@/modules/tenancy/tenancy.service";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);
  const profile = await getCommercialProfile(scope);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Commercial Profile</h1>
        <p className="text-sm text-zinc-500">
          Used as an input to every AI-drafted message (PRD FR-6) — edits apply
          to future drafts only.
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}
