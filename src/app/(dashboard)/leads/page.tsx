import Link from "next/link";
import { Plus, Search, UserPlus } from "lucide-react";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { listLeads } from "@/modules/prospecting/lead.service";
import {
  refreshLeadsMomentum,
  sortByMomentumPriority,
} from "@/modules/outreach/momentum.service";
import { LeadStatus, Momentum } from "@/generated/prisma/enums";
import { STATUS_LABELS, MOMENTUM_LABELS } from "@/lib/domain-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MomentumBadge } from "@/components/momentum-badge";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const STATUS_OPTIONS = Object.values(LeadStatus);
const MOMENTUM_OPTIONS = Object.values(Momentum);

const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return !!value && (STATUS_OPTIONS as string[]).includes(value);
}

function isMomentum(value: string | undefined): value is Momentum {
  return !!value && (MOMENTUM_OPTIONS as string[]).includes(value);
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    niche?: string;
    search?: string;
    momentum?: string;
  }>;
}) {
  const params = await searchParams;
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const status = isLeadStatus(params.status) ? params.status : undefined;
  const momentumFilter = isMomentum(params.momentum) ? params.momentum : undefined;

  const rawLeads = await listLeads(scope, {
    status,
    niche: params.niche || undefined,
    search: params.search || undefined,
  });

  // Momentum reflects time passing, not just events, so it's recomputed on
  // every read (PRD §1.4) rather than trusted from the stored column alone.
  const freshLeads = await refreshLeadsMomentum(scope, rawLeads);
  const filteredLeads = momentumFilter
    ? freshLeads.filter((lead) => lead.momentum === momentumFilter)
    : freshLeads;
  const leads = sortByMomentumPriority(filteredLeads);

  const hasActiveFilters = Boolean(
    params.search || params.niche || params.status || params.momentum,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leads"
        description={`${leads.length} prospecto${leads.length === 1 ? "" : "s"}`}
        actions={
          <Button
            nativeButton={false}
            render={
              <Link href="/leads/new">
                <Plus />
                Adicionar Lead
              </Link>
            }
          />
        }
      />

      <Card>
        <CardContent>
          <form className="flex flex-wrap items-center gap-3" method="get">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                name="search"
                placeholder="Buscar por nome..."
                defaultValue={params.search}
                className="h-8 w-48 pl-8"
              />
            </div>
            <Input
              type="text"
              name="niche"
              placeholder="Filtrar por especialidade..."
              defaultValue={params.niche}
              className="h-8 w-48"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className={SELECT_CLASS}
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </select>
            <select
              name="momentum"
              defaultValue={params.momentum ?? ""}
              className={SELECT_CLASS}
            >
              <option value="">Todos os momentum</option>
              {MOMENTUM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {MOMENTUM_LABELS[option]}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" size="sm">
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {leads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title={
            hasActiveFilters
              ? "Nenhum lead encontrado"
              : "Nenhum lead ainda"
          }
          description={
            hasActiveFilters
              ? "Tente ajustar os filtros para ver mais resultados."
              : "Adicione seu primeiro prospecto para começar a prospectar."
          }
          action={
            !hasActiveFilters && (
              <Button
            nativeButton={false}
            render={
              <Link href="/leads/new">
                <Plus />
                Adicionar Lead
              </Link>
            }
          />
            )
          }
        />
      ) : (
        <Card>
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
              {leads.map((lead) => (
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
        </Card>
      )}
    </div>
  );
}
