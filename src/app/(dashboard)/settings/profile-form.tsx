"use client";

import { useActionState } from "react";
import { updateUserNameAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  name,
  email,
}: {
  name: string | null;
  email: string;
}) {
  const [state, action, pending] = useActionState(
    updateUserNameAction,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome de exibição</Label>
        <Input id="name" name="name" required defaultValue={name ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>E-mail</Label>
        <p className="text-sm text-muted-foreground">{email}</p>
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
