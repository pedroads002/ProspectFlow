"use client";

import { useState } from "react";
import { deleteLeadAction } from "../actions";

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 underline"
      >
        Delete lead
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-zinc-500">
        Delete this lead? This cannot be undone.
      </span>
      <form action={deleteLeadAction.bind(null, leadId)}>
        <button type="submit" className="text-red-600 underline">
          Confirm delete
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="underline"
      >
        Cancel
      </button>
    </div>
  );
}
