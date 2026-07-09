import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createLeadAction } from "../actions";
import { LeadForm } from "../lead-form";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function NewLeadPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/leads"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para Leads
      </Link>

      <PageHeader title="Adicionar Lead" />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados do prospecto</CardTitle>
          <CardDescription>
            Apenas Nome e Especialidade são obrigatórios — preencha o resto se tiver.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadForm
            action={createLeadAction}
            submitLabel="Adicionar Lead"
            pendingLabel="Adicionando..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
