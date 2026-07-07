import Link from "next/link";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { listTenantMembers } from "@/modules/tenancy/tenancy.service";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";

export default async function DashboardPage() {
  const { tenant, user } = await getCurrentTenantUser();
  const members = await listTenantMembers(scopeToTenant(tenant.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.email}</h1>
        <p className="text-zinc-500">Workspace: {tenant.name}</p>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Team
        </h2>
        <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
          {members.map((member) => (
            <li key={member.id} className="py-2 text-sm">
              {member.email} <span className="text-zinc-500">· {member.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-zinc-500">
        Head to{" "}
        <Link href="/leads" className="underline">
          Leads
        </Link>{" "}
        to manage your prospects. AI drafting and conversation assistance
        arrive in upcoming sprints — see MVP_BACKLOG.md.
      </p>
    </div>
  );
}
