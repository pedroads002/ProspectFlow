"use client";

import { useState } from "react";
import { deleteLeadAction } from "../actions";
import { Button } from "@/components/ui/button";

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        Excluir lead
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <form action={deleteLeadAction.bind(null, leadId)}>
        <Button type="submit" variant="destructive" size="sm">
          Confirmar exclusão
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancelar
      </Button>
    </div>
  );
}
