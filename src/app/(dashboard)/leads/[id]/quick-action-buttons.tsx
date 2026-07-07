"use client";

import { useTransition } from "react";
import { applyQuickActionAction } from "../actions";
import type { QuickAction } from "@/modules/outreach/types";

const LABELS: Record<QuickAction, string> = {
  NO_REPLY: "No Reply",
  REPLIED: "Replied",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow-up",
  MEETING_SCHEDULED: "Meeting Scheduled",
  SALE_COMPLETED: "Sale Completed",
  LOST: "Lost",
};

export function QuickActionButtons({
  leadId,
  actions,
}: {
  leadId: string;
  actions: QuickAction[];
}) {
  const [isPending, startTransition] = useTransition();

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              applyQuickActionAction(leadId, action);
            })
          }
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          {LABELS[action]}
        </button>
      ))}
    </div>
  );
}
