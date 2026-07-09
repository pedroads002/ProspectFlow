"use client";

import { useActionState } from "react";
import { FileText } from "lucide-react";
import { requestProposalDraftAction, markMessageSentAction } from "../actions";
import type { OutboundMessage } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ProposalPanel({
  leadId,
  latestProposal,
}: {
  leadId: string;
  latestProposal: OutboundMessage | null;
}) {
  const requestProposalForLead = requestProposalDraftAction.bind(null, leadId);
  const [draftState, draftAction, draftPending] = useActionState(
    requestProposalForLead,
    undefined,
  );

  const hasPendingDraft = latestProposal?.status === "DRAFT";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          Proposta
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hasPendingDraft ? (
          <form action={draftAction} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="proposal-channel" className="text-sm font-medium">
                Canal
              </label>
              <select
                id="proposal-channel"
                name="channel"
                className={SELECT_CLASS}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
              </select>
            </div>
            <Button type="submit" disabled={draftPending}>
              {draftPending ? "Gerando..." : "Gerar Proposta"}
            </Button>
          </form>
        ) : (
          <form
            action={markMessageSentAction.bind(null, latestProposal.id, leadId)}
            className="flex flex-col gap-3"
          >
            <Textarea name="content" defaultValue={latestProposal.content} rows={6} />
            <p className="text-xs text-muted-foreground">
              Canal: {latestProposal.channel} — copie esta proposta, envie
              manualmente e confirme abaixo.
            </p>
            <Button type="submit" className="self-start">
              Marcar como enviada
            </Button>
          </form>
        )}

        {draftState?.error && (
          <p className="text-sm text-destructive">{draftState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
