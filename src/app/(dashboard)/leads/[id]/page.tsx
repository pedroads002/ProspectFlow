import { notFound } from "next/navigation";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { getLead } from "@/modules/prospecting/lead.service";
import { getAvailableQuickActions } from "@/modules/outreach/status.service";
import { listMessagesForLead } from "@/modules/outreach/message.service";
import { listConversationForLead } from "@/modules/outreach/conversation.service";
import { getLeadTimeline } from "@/modules/outreach/timeline.service";
import { LeadEditForm } from "./lead-edit-form";
import { DeleteLeadButton } from "./delete-lead-button";
import { QuickActionButtons } from "./quick-action-buttons";
import { MessagePanel } from "./message-panel";
import { ConversationPanel } from "./conversation-panel";
import { ProposalPanel } from "./proposal-panel";
import { LeadTimeline } from "./lead-timeline";

/** PRD §7.1: only these statuses can transition to PROPOSAL_SENT via a sent proposal. */
const PROPOSAL_ELIGIBLE_STATUSES = ["QUALIFIED", "NEGOTIATION"];

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
  const conversationEntries = await listConversationForLead(scope, lead.id);
  const latestProposal = messages.find((message) => message.kind === "PROPOSAL") ?? null;
  const showProposalPanel =
    PROPOSAL_ELIGIBLE_STATUSES.includes(lead.status) || latestProposal !== null;
  const timelineItems = await getLeadTimeline(scope, lead.id);

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

      <ConversationPanel leadId={lead.id} entryCount={conversationEntries.length} />

      {showProposalPanel && (
        <ProposalPanel leadId={lead.id} latestProposal={latestProposal} />
      )}

      <LeadEditForm lead={lead} />

      <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          History
        </h2>
        <LeadTimeline items={timelineItems} />
      </div>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <DeleteLeadButton leadId={lead.id} />
      </div>
    </div>
  );
}
