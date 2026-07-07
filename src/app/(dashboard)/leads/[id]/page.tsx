import { notFound } from "next/navigation";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { getLead } from "@/modules/prospecting/lead.service";
import { getAvailableQuickActions } from "@/modules/outreach/status.service";
import { listMessagesForLead } from "@/modules/outreach/message.service";
import { LeadEditForm } from "./lead-edit-form";
import { DeleteLeadButton } from "./delete-lead-button";
import { QuickActionButtons } from "./quick-action-buttons";
import { MessagePanel } from "./message-panel";

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

  const quickActions = getAvailableQuickActions(lead.status);
  const messages = await listMessagesForLead(scope, lead.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{lead.name}</h1>
        <p className="text-sm text-zinc-500">
          Status: {lead.status} · Momentum: {lead.momentum}
        </p>
      </div>

      <QuickActionButtons leadId={lead.id} actions={quickActions} />

      <MessagePanel leadId={lead.id} latestDraft={messages[0] ?? null} />

      <LeadEditForm lead={lead} />

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <DeleteLeadButton leadId={lead.id} />
      </div>
    </div>
  );
}
