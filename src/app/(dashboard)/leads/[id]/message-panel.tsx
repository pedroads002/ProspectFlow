"use client";

import { useActionState } from "react";
import { MessageSquare } from "lucide-react";
import {
  requestDraftAction,
  createManualDraftAction,
  markMessageSentAction,
} from "../actions";
import type { OutboundMessage } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function MessagePanel({
  leadId,
  latestDraft,
}: {
  leadId: string;
  latestDraft: OutboundMessage | null;
}) {
  const requestDraftForLead = requestDraftAction.bind(null, leadId);
  const [draftState, draftAction, draftPending] = useActionState(
    requestDraftForLead,
    undefined,
  );

  const createManualForLead = createManualDraftAction.bind(null, leadId);
  const [manualState, manualAction, manualPending] = useActionState(
    createManualForLead,
    undefined,
  );

  const hasPendingDraft = latestDraft?.status === "DRAFT";
  const isBusy = draftPending || manualPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          Mensagem
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hasPendingDraft ? (
          <form className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="channel" className="text-sm font-medium">
                Canal
              </label>
              <select id="channel" name="channel" className={SELECT_CLASS}>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
              </select>
            </div>
            <Button type="submit" formAction={draftAction} disabled={isBusy}>
              {draftPending ? "Gerando rascunho..." : "Gerar Rascunho"}
            </Button>
            <Button
              type="submit"
              formAction={manualAction}
              variant="outline"
              disabled={isBusy}
            >
              {manualPending ? "Criando..." : "Escrever manualmente"}
            </Button>
          </form>
        ) : (
          <form
            action={markMessageSentAction.bind(null, latestDraft.id, leadId)}
            className="flex flex-col gap-3"
          >
            <Textarea
              name="content"
              defaultValue={latestDraft.content}
              placeholder={
                latestDraft.aiGenerated ? undefined : "Escreva sua mensagem..."
              }
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Canal: {latestDraft.channel} — copie esta mensagem, envie
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
        {manualState?.error && (
          <p className="text-sm text-destructive">{manualState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
