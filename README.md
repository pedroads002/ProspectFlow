# ProspectFlow

AI-assisted outbound prospecting platform for consultants and commercial professionals. Not a
CRM — ProspectFlow automates the repetitive parts of outbound prospecting (drafting first-contact
messages, tracking conversations, preparing proposals) while keeping a human reviewing and sending
every message.

Full product and technical context lives in the docs below — read them before contributing:

- [VISION.md](./VISION.md) — product vision and philosophy
- [PRD.md](./PRD.md) — requirements, user flows, domain concepts (Lead lifecycle, Momentum)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — technical architecture
- [DATA_MODEL.md](./DATA_MODEL.md) — database design
- [MVP_BACKLOG.md](./MVP_BACKLOG.md) — sprint plan
- [DECISIONS.md](./DECISIONS.md) — why the stack/architecture look like this
- [CLAUDE.md](./CLAUDE.md) — working conventions for this repo

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | Next.js (App Router) |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| Auth | Supabase Auth |
| AI | Vercel AI SDK, provider-agnostic (Anthropic default; OpenAI/Google supported) |
| Hosting | Vercel |

See [DECISIONS.md](./DECISIONS.md) for the reasoning behind each choice.

## Prerequisites

- Node.js LTS
- A Supabase project (Postgres + Auth)
- API key(s) for at least one supported AI provider (Anthropic recommended as default)
- Vercel account (for deployment; not required for local development)

## Installation

```bash
git clone <repository-url>
cd prospectflow
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your real values:

```bash
cp .env.example .env
```

```bash
# Pooled connection (pgbouncer, port 6543) — used by the generated Prisma Client at runtime.
DATABASE_URL="postgresql://..."
# Direct connection (port 5432) — used by the Prisma CLI for migrations/introspection.
DIRECT_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."         # Server-side only — never expose to the client

# AI Providers (add only the ones in use; routing config lives in src/modules/ai/router.ts)
ANTHROPIC_API_KEY="..."
OPENAI_API_KEY="..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

Use `.env` rather than `.env.local` here: `prisma.config.ts` loads variables via `dotenv/config`,
which reads `.env` by default — `.env.local` would work for the Next.js app itself but silently
not be picked up by the Prisma CLI. Never commit `.env` (it's gitignored). Production/preview
environment variables are configured in the Vercel project settings, scoped per environment.

## Local Development

```bash
# Apply the latest database schema
npx prisma migrate dev

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Running Locally (day-to-day)

```bash
npm run dev          # start dev server
npx prisma studio    # inspect/edit database contents visually
npx prisma migrate dev --name <change-name>   # create a new migration after schema changes
```

## Deployment

- **Production:** pushes to `main` deploy automatically via Vercel.
- **Preview:** every branch/PR gets its own preview deployment with isolated environment
  variables.
- Database migrations are applied as part of the deploy step (`prisma migrate deploy`) — see
  CLAUDE.md's Database Migrations section for the workflow contributors should follow before
  merging schema changes.

## Project Structure

```
prospectflow/
├── prisma/              # Schema + migrations
├── src/
│   ├── app/              # Next.js routes (thin — routing/layout only)
│   ├── modules/           # Business logic, organized by domain
│   │   ├── tenancy/
│   │   ├── prospecting/
│   │   ├── outreach/
│   │   ├── ai/
│   │   └── proposals/
│   ├── components/        # Shared, presentation-only UI components
│   └── lib/                # Cross-cutting: env config, db client, logging
└── <root-level docs — this file, VISION.md, PRD.md, etc.>
```

Full rationale for this structure is in [ARCHITECTURE.md](./ARCHITECTURE.md#9-folder-structure).
