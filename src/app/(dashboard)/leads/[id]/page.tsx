import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AtSign, History, MessageCircle, Trash2, UserRound } from "lucide-react";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { getLead } from "@/modules/prospecting/lead.service";
import { getAvailableQuickActions } from "@/modules/outreach/status.service";
import { listMessagesForLead } from "@/modules/outreach/message.service";
import { listConversationForLead } from "@/modules/outreach/conversation.service";
import { getLeadTimeline } from "@/modules/outreach/timeline.service";
import { MomentumBadge } from "@/components/momentum-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { updateLeadAction } from "../actions";
import { LeadForm } from "../lead-form";
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
      <Link
        href="/leads"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para Leads
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {lead.name}
            </h1>
            <p className="text-muted-foreground">{lead.niche}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.instagram && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`https://instagram.com/${lead.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AtSign />
                  Instagram
                </a>
              }
            />
          )}
          {lead.whatsapp && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle />
                  WhatsApp
                </a>
              }
            />
          )}
          <StatusBadge status={lead.status} />
          <MomentumBadge momentum={lead.momentum} />
        </div>
      </div>

      <QuickActionButtons leadId={lead.id} actions={quickActions} />

      <MessagePanel leadId={lead.id} latestDraft={messages[0] ?? null} />

      <ConversationPanel leadId={lead.id} entryCount={conversationEntries.length} />

      {showProposalPanel && (
        <ProposalPanel leadId={lead.id} latestProposal={latestProposal} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            Dados do prospecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm
            lead={lead}
            action={updateLeadAction.bind(null, lead.id)}
            submitLabel="Salvar alterações"
            pendingLabel="Salvando..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeadTimeline items={timelineItems} />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Excluir este lead</p>
              <p className="text-sm text-muted-foreground">
                Essa ação não pode ser desfeita.
              </p>
            </div>
          </div>
          <DeleteLeadButton leadId={lead.id} />
        </CardContent>
      </Card>
    </div>
  );
}
