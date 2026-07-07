"use client";

import { useActionState } from "react";
import { saveCommercialProfileAction } from "./actions";
import type { CommercialProfile } from "@/generated/prisma/client";

export function SettingsForm({
  profile,
}: {
  profile: CommercialProfile | null;
}) {
  const [state, action, pending] = useActionState(
    saveCommercialProfileAction,
    undefined,
  );

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="valueProposition" className="text-sm">
          Value proposition / expertise
        </label>
        <textarea
          id="valueProposition"
          name="valueProposition"
          rows={3}
          required
          defaultValue={profile?.valueProposition ?? ""}
          placeholder="What you sell and why it matters to your prospects."
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="toneDescription" className="text-sm">
          Communication tone
        </label>
        <textarea
          id="toneDescription"
          name="toneDescription"
          rows={3}
          required
          defaultValue={profile?.toneDescription ?? ""}
          placeholder="How you like to sound: formal/informal, length, phrases to use or avoid."
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="servicesOffered" className="text-sm">
          Services offered (optional)
        </label>
        <textarea
          id="servicesOffered"
          name="servicesOffered"
          rows={3}
          defaultValue={profile?.servicesOffered ?? ""}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-green-600">Saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
