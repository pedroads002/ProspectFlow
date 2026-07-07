"use client";

import { useActionState } from "react";
import {
  requestDraftAction,
  createManualDraftAction,
  markMessageSentAction,
} from "../actions";
import type { OutboundMessage } from "@/generated/prisma/client";

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
    <div className="flex flex-col gap-4 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Message
      </h2>

      {!hasPendingDraft ? (
        <form className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="channel" className="text-sm">
              Channel
            </label>
            <select
              id="channel"
              name="channel"
              className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>
          </div>
          <button
            type="submit"
            formAction={draftAction}
            disabled={isBusy}
            className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {draftPending ? "Drafting..." : "Generate Draft"}
          </button>
          <button
            type="submit"
            formAction={manualAction}
            disabled={isBusy}
            className="rounded border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            {manualPending ? "Creating..." : "Write manually instead"}
          </button>
        </form>
      ) : (
        <form
          action={markMessageSentAction.bind(null, latestDraft.id, leadId)}
          className="flex flex-col gap-3"
        >
          <textarea
            name="content"
            defaultValue={latestDraft.content}
            placeholder={
              latestDraft.aiGenerated ? undefined : "Write your message..."
            }
            rows={5}
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="text-xs text-zinc-500">
            Channel: {latestDraft.channel} — copy this message, send it
            manually, then confirm below.
          </p>
          <button
            type="submit"
            className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            Mark as sent
          </button>
        </form>
      )}

      {draftState?.error && (
        <p className="text-sm text-red-600">{draftState.error}</p>
      )}
      {manualState?.error && (
        <p className="text-sm text-red-600">{manualState.error}</p>
      )}
    </div>
  );
}
