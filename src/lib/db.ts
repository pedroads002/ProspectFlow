import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 no longer reads the connection string from schema.prisma — the
 * generated client connects through an explicit driver adapter instead (see
 * prisma/schema.prisma's datasource comment). DATABASE_URL is the pooled
 * (pgbouncer) connection; DIRECT_URL (used only by the Prisma CLI) is
 * configured separately in prisma.config.ts.
 *
 * Cached on `globalThis` in development so Next.js's module-reload doesn't
 * open a fresh connection pool on every edit.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg(process.env.DATABASE_URL!);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
