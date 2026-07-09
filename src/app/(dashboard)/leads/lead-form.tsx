"use client";

import { useRef, useState, useActionState } from "react";
import type { Lead } from "@/modules/prospecting/types";
import type { LeadFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const NICHE_PRESETS = ["Clínica Odontológica", "Clínica de Estética"];

/**
 * Shared by /leads/new and the Lead detail page's edit section — one form,
 * one validation path (lead.schema.ts), so create and edit can never drift
 * apart from each other.
 */
export function LeadForm({
  lead,
  action,
  submitLabel,
  pendingLabel,
}: {
  lead?: Lead;
  action: (prevState: LeadFormState, formData: FormData) => Promise<LeadFormState>;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [niche, setNiche] = useState(lead?.niche ?? "");
  const nicheInputRef = useRef<HTMLInputElement>(null);
  const isCustomNiche = niche !== "" && !NICHE_PRESETS.includes(niche);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-48 flex-1 flex-col gap-1.5">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            name="instagram"
            placeholder="@perfil"
            defaultValue={lead?.instagram ?? ""}
          />
        </div>
        <div className="flex w-36 flex-col gap-1.5">
          <Label htmlFor="followerCount">Seguidores</Label>
          <Input
            id="followerCount"
            name="followerCount"
            type="number"
            min={0}
            placeholder="ex.: 4200"
            defaultValue={lead?.followerCount ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required defaultValue={lead?.name ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="niche">Especialidade</Label>
        <div className="flex flex-wrap gap-2">
          {NICHE_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={niche === preset ? "default" : "outline"}
              size="sm"
              onClick={() => setNiche(preset)}
            >
              {preset}
            </Button>
          ))}
          <Button
            type="button"
            variant={isCustomNiche ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setNiche("");
              nicheInputRef.current?.focus();
            }}
          >
            Outro
          </Button>
        </div>
        <Input
          id="niche"
          name="niche"
          required
          ref={nicheInputRef}
          value={niche}
          onChange={(event) => setNiche(event.target.value)}
          placeholder="ex.: Clínica Odontológica"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Análise do Perfil</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="O que chamou atenção neste perfil? (especialidade, posts recentes, potencial de fechamento...)"
          defaultValue={lead?.notes ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          name="whatsapp"
          placeholder="+55 11 90000-0000"
          defaultValue={lead?.whatsapp ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Informe pelo menos um contato (Instagram ou WhatsApp).
        </p>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
