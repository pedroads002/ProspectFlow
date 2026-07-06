// Prisma CLI configuration (migrate, studio, introspection).
// Uses the direct (non-pooled) connection — the pooled DATABASE_URL is used by the
// generated client at runtime instead (see prisma/schema.prisma). See README.md's
// Environment Variables section for why both exist.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
