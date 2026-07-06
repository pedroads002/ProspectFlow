import type { Tenant, User } from "@/generated/prisma/client";

/** Every tenant-scoped query must carry this — see scoped-client.ts. */
export type TenantScope = {
  tenantId: string;
};

/** Resolved identity for the current request: who they are and which tenant they belong to. */
export type AuthenticatedContext = {
  tenant: Tenant;
  user: User;
};
