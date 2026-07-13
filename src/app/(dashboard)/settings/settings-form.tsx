"use client";

import { useActionState } from "react";
import { saveCommercialProfileAction } from "./actions";
import type { CommercialProfile } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

function FieldGroupLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  );
}

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
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <FieldGroupLabel>Sobre o seu negócio</FieldGroupLabel>

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
          <Label htmlFor="servicesOffered">Serviços oferecidos (opcional)</Label>
          <Textarea
            id="servicesOffered"
            name="servicesOffered"
            rows={3}
            defaultValue={profile?.servicesOffered ?? ""}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="targetAudience">Público-alvo ideal (opcional)</Label>
          <Textarea
            id="targetAudience"
            name="targetAudience"
            rows={2}
            defaultValue={profile?.targetAudience ?? ""}
            placeholder="Para quem você vende melhor: porte do negócio, momento, dores comuns."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="differentiators">Diferenciais em relação à concorrência (opcional)</Label>
          <Textarea
            id="differentiators"
            name="differentiators"
            rows={2}
            defaultValue={profile?.differentiators ?? ""}
            placeholder="O que te diferencia de outros consultores/agências que oferecem algo parecido."
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <FieldGroupLabel>Como você se comunica</FieldGroupLabel>

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
          <Label htmlFor="exampleMessage">Uma mensagem sua, como exemplo (opcional)</Label>
          <Textarea
            id="exampleMessage"
            name="exampleMessage"
            rows={3}
            defaultValue={profile?.exampleMessage ?? ""}
            placeholder="Cole uma mensagem real que você já mandou e que representa bem o seu estilo."
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <FieldGroupLabel>Objeções</FieldGroupLabel>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="commonObjections">Objeções mais comuns (opcional)</Label>
          <Textarea
            id="commonObjections"
            name="commonObjections"
            rows={3}
            defaultValue={profile?.commonObjections ?? ""}
            placeholder="O que os prospectos mais respondem para não seguir em frente, e como você prefere responder."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prohibitedTerms">Palavras, frases ou temas a evitar (opcional)</Label>
          <Textarea
            id="prohibitedTerms"
            name="prohibitedTerms"
            rows={2}
            defaultValue={profile?.prohibitedTerms ?? ""}
          />
        </div>
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
