"use client";

import { useActionState } from "react";
import {
  pasteConversationAction,
  analyzeConversationAction,
} from "../actions";

const NEXT_ACTION_LABELS: Record<string, string> = {
  CONTINUE_CONVERSATION: "Continue the conversation",
  SCHEDULE_MEETING: "Schedule a meeting",
  SEND_PROPOSAL: "Send a proposal",
  CLOSE_LOST: "Consider closing as lost",
};

export function ConversationPanel({
  leadId,
  entryCount,
}: {
  leadId: string;
  entryCount: number;
}) {
  const pasteForLead = pasteConversationAction.bind(null, leadId);
  const [pasteState, pasteAction, pastePending] = useActionState(
    pasteForLead,
    undefined,
  );

  const analyzeForLead = analyzeConversationAction.bind(null, leadId);
  const [analysisState, analyzeAction, analyzePending] = useActionState(
    analyzeForLead,
    undefined,
  );

  const result = analysisState && "result" in analysisState ? analysisState.result : undefined;

  return (
    <div className="flex flex-col gap-4 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Conversation Assistance
      </h2>

      <form action={pasteAction} className="flex flex-col gap-3">
        <textarea
          name="rawText"
          rows={5}
          placeholder="Paste the conversation with this prospect..."
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pastePending}
            className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {pastePending ? "Saving..." : "Save conversation"}
          </button>
          <span className="text-xs text-zinc-500">
            {entryCount === 0
              ? "No conversation logged yet."
              : `${entryCount} entr${entryCount === 1 ? "y" : "ies"} logged.`}
          </span>
        </div>
        {pasteState?.error && (
          <p className="text-sm text-red-600">{pasteState.error}</p>
        )}
      </form>

      <form action={analyzeAction} className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="submit"
          disabled={analyzePending || entryCount === 0}
          className="self-start rounded border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          {analyzePending ? "Analyzing..." : "Get AI Assistance"}
        </button>

        {analysisState && "error" in analysisState && (
          <p className="text-sm text-red-600">{analysisState.error}</p>
        )}

        {result && (
          <div className="flex flex-col gap-3 text-sm">
            {result.summary && (
              <div>
                <p className="font-medium text-zinc-500">Summary</p>
                <p>{result.summary}</p>
              </div>
            )}
            {result.sentiment && (
              <div>
                <p className="font-medium text-zinc-500">Sentiment / buying signals</p>
                <p>{result.sentiment}</p>
              </div>
            )}
            {result.objections && result.objections.length > 0 && (
              <div>
                <p className="font-medium text-zinc-500">Objections</p>
                <ul className="list-inside list-disc">
                  {result.objections.map((objection, index) => (
                    <li key={index}>{objection}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.suggestedNextMessage && (
              <div>
                <p className="font-medium text-zinc-500">Suggested next message</p>
                <p>{result.suggestedNextMessage}</p>
              </div>
            )}
            {result.suggestedFollowUpStrategy && (
              <div>
                <p className="font-medium text-zinc-500">If they go silent</p>
                <p>{result.suggestedFollowUpStrategy}</p>
              </div>
            )}
            {result.recommendedNextAction && (
              <div>
                <p className="font-medium text-zinc-500">Recommended next action</p>
                <p>{NEXT_ACTION_LABELS[result.recommendedNextAction]}</p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
