# AGENTS.md

Canonical agent entry for this repo. Compact and operational. Deeper durable context lives in `.context/`.

## Project Context

- [.context/project-context.md](.context/project-context.md) — what this service is, architecture, ownership map, integrations.
- [.context/engineering-guide.md](.context/engineering-guide.md) — commands, TypeScript standards, framework patterns, safety.
- [.context/roadmap-notes.md](.context/roadmap-notes.md) — durable decisions, accepted debt, staged work.

## Stack

Node + TypeScript backend. Hono for HTTP (with `@hono/node-server`), Zod for request/response validation, Drizzle ORM + Postgres for persistence, Vitest + PGlite for tests, Pino for structured logging. Optional async worker seam: SQS or BullMQ consumer with Redis hot state.

## Commands

Package manager: TODO (pnpm / npm / bun). Runtime: TODO (Node 22 / Node 24).

```
<pkg> install
<pkg> run dev            # tsx watch on src/index.ts (or equivalent)
<pkg> run typecheck      # tsc --noEmit
<pkg> run lint           # Biome or ESLint
<pkg> run build          # tsc to dist/
<pkg> run start          # node dist/index.js
<pkg> run test           # Vitest (fast suite)
<pkg> run db:generate    # drizzle-kit generate
<pkg> run db:migrate     # apply migrations
```

Cite exact script scope. Do not claim a command runs every test unless `package.json` proves it.

## Standards

- Strict TypeScript, ESM (`"type": "module"`). Explicit `.ts` extensions on relative imports if tsc rewrites them.
- Route handlers validate inputs with Zod before touching the database or external services.
- Database access lives behind a service module. Routes call services, never the ORM directly.
- Credentials and connection config are parsed once at startup, not re-read per request.
- Use parameter binding for user-controlled values. Identifier-shaped inputs (table/column names) must be allow-listed.

## Safety

Do not read `.env`, `.secrets`, certs, tokens, DSNs, cloud credentials. Full list in `.context/engineering-guide.md`. Use `.env.example` for variable names only.

## Where To Edit

| File | Owns |
|---|---|
| `src/routes/` | Hono route handlers. Validate, delegate, respond. |
| `src/services/` | Business logic, DB queries via Drizzle, provider SDK calls. |
| `src/db/schema.ts` | Drizzle schema. Source of truth for tables. |
| `src/db/migrations/` | Generated migration SQL. Do not hand-edit. |
| `src/config.ts` | Env parsing and typed config object. |
| `src/lib/logger.ts` | Pino logger factory. |
| `drizzle.config.ts` | Migration generation config. |
| `.context/` | Durable architecture, decisions, debt. |
| `AGENTS.md` | This file. Keep compact; push detail into `.context/`. |

## Maintenance

Update commands here when `package.json` scripts change. Update `.context/` when architecture, integrations, or durable decisions shift. Record pipeline/contract changes in `.context/roadmap-notes.md` so they survive turnover.
