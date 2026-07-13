import { Briefcase, UserRound } from "lucide-react";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { getCommercialProfile } from "@/modules/tenancy/tenancy.service";
import { SettingsForm } from "./settings-form";
import { ProfileForm } from "./profile-form";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const { tenant, user } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);
  const profile = await getCommercialProfile(scope);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            Perfil
          </CardTitle>
          <CardDescription>
            Como seu nome aparece na saudação, no menu lateral e no avatar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} email={user.email} />
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-4 text-muted-foreground" />
            Perfil Comercial
          </CardTitle>
          <CardDescription>
            Usado como base para toda mensagem gerada por IA — alterações
            valem apenas para rascunhos futuros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
