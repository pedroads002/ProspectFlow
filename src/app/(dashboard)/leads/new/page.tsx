"use client";

import { useActionState } from "react";
import { createLeadAction } from "../actions";

export default function NewLeadPage() {
  const [state, action, pending] = useActionState(createLeadAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add Lead</h1>

      <form action={action} className="flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="niche" className="text-sm">
            Niche
          </label>
          <input
            id="niche"
            name="niche"
            required
            placeholder="e.g. Dental Clinic"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="instagram" className="text-sm">
            Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            placeholder="@handle"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="whatsapp" className="text-sm">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            placeholder="+55 11 90000-0000"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Adding..." : "Add Lead"}
        </button>
      </form>
    </div>
  );
}
