"use client";

import { useActionState } from "react";
import { saveCommercialProfileAction } from "./actions";
import type { CommercialProfile } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="valueProposition">Proposta de valor / especialidade</Label>
        <Textarea
          id="valueProposition"
          name="valueProposition"
          rows={3}
          required
          defaultValue={profile?.valueProposition ?? ""}
          placeholder="O que você vende e por que isso importa para seus prospectos."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="toneDescription">Tom de comunicação</Label>
        <Textarea
          id="toneDescription"
          name="toneDescription"
          rows={3}
          required
          defaultValue={profile?.toneDescription ?? ""}
          placeholder="Como você gosta de soar: formal/informal, tamanho das mensagens, expressões para usar ou evitar."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="servicesOffered">Serviços oferecidos (opcional)</Label>
        <Textarea
          id="servicesOffered"
          name="servicesOffered"
          rows={3}
          defaultValue={profile?.servicesOffered ?? ""}
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-primary-strong">Salvo com sucesso.</p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
