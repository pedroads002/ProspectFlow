import Link from "next/link";
import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { scopeToTenant } from "@/modules/tenancy/scoped-client";
import { listLeads } from "@/modules/prospecting/lead.service";
import { LeadStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS = Object.values(LeadStatus);

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return !!value && (STATUS_OPTIONS as string[]).includes(value);
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; niche?: string; search?: string }>;
}) {
  const params = await searchParams;
  const { tenant } = await getCurrentTenantUser();
  const scope = scopeToTenant(tenant.id);

  const status = isLeadStatus(params.status) ? params.status : undefined;

  const leads = await listLeads(scope, {
    status,
    niche: params.niche || undefined,
    search: params.search || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <Link
          href="/leads/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          Add Lead
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="search"
          placeholder="Search by name..."
          defaultValue={params.search}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="text"
          name="niche"
          placeholder="Filter by niche..."
          defaultValue={params.niche}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Filter
        </button>
      </form>

      {leads.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No leads yet. Add your first prospect to get started.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Niche</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Momentum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="py-2">
                  <Link href={`/leads/${lead.id}`} className="underline">
                    {lead.name}
                  </Link>
                </td>
                <td className="py-2">{lead.niche}</td>
                <td className="py-2">{lead.status}</td>
                <td className="py-2">{lead.momentum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
