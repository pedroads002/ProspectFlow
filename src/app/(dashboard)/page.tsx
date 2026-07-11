import Link from "next/link";
import {
  ArrowRight,
  Send,
  MessageSquarePlus,
  MessageSquareReply,
  Repeat2,
  CalendarClock,
  UserPlus,
} from "lucide-react";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { getDailySummary } from "@/modules/outreach/daily-summary.service";
import { getPriorityLeads } from "@/modules/outreach/momentum.service";
import { getFirstName } from "@/lib/user-display";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StatTile } from "@/components/stat-tile";
import { StatusBadge } from "@/components/status-badge";
import { MomentumBadge } from "@/components/momentum-badge";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const PRIORITY_QUEUE_LIMIT = 8;

export default async function DashboardPage() {
  const { tenant, user } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);
  const firstName = getFirstName(user.name);

  const [summary, priorityLeads] = await Promise.all([
    getDailySummary(scope),
    getPriorityLeads(scope, { limit: PRIORITY_QUEUE_LIMIT }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={firstName ? `Bem-vindo, ${firstName}!` : "Bem-vindo!"}
        description="Acompanhe seus prospectos e continue sua prospecção de onde parou."
        actions={
          <Button
            nativeButton={false}
            render={
              <Link href="/leads">
                Ir para Leads
                <ArrowRight />
              </Link>
            }
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile icon={Send} label="Mensagens enviadas" value={summary.messagesSent} />
        <StatTile
          icon={MessageSquarePlus}
          label="Conversas iniciadas"
          value={summary.conversationsStarted}
        />
        <StatTile icon={MessageSquareReply} label="Respostas" value={summary.replies} />
        <StatTile icon={Repeat2} label="Follow-ups" value={summary.followUps} />
        <StatTile
          icon={CalendarClock}
          label="Reuniões agendadas"
          value={summary.meetingsScheduled}
        />
      </div>

      {priorityLeads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhum lead ativo"
          description="Adicione seu primeiro prospecto para começar a prospectar."
          action={
            <Button
              nativeButton={false}
              render={
                <Link href="/leads/new">
                  <UserPlus />
                  Adicionar Lead
                </Link>
              }
            />
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Prioridades de Hoje</CardTitle>
            <CardDescription>
              Ordenado por Momentum — priorização por IA em breve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Momentum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priorityLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium text-primary-strong hover:underline"
                      >
                        {lead.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.niche}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <MomentumBadge momentum={lead.momentum} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Link
              href="/leads"
              className="text-sm font-medium text-primary-strong hover:underline"
            >
              Ver todos os leads
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
