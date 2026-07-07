import { notFound } from "next/navigation";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { getLead } from "@/modules/prospecting/lead.service";
import { LeadEditForm } from "./lead-edit-form";
import { DeleteLeadButton } from "./delete-lead-button";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const lead = await getLead(scope, id);
  if (!lead) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{lead.name}</h1>
        <p className="text-sm text-zinc-500">
          Status: {lead.status} · Momentum: {lead.momentum}
        </p>
      </div>

      <LeadEditForm lead={lead} />

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <DeleteLeadButton leadId={lead.id} />
      </div>
    </div>
  );
}
