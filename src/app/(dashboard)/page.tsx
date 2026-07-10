import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { listTenantMembers } from "@/modules/tenancy/tenancy.service";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/domain-labels";
import { getFirstName, getInitials } from "@/lib/user-display";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const { tenant, user } = await getCurrentTenantUser();
  const members = await listTenantMembers(scopeToTenant(tenant.id));
  const firstName = getFirstName(user.name);

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            Equipe
          </CardTitle>
          <CardDescription>Pessoas com acesso a esta conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 py-2.5 text-sm"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {getInitials(member.name) || member.email.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 truncate">
                  {member.name || member.email}
                </span>
                <span className="text-muted-foreground">
                  {ROLE_LABELS[member.role]}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
