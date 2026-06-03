# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial Vite + React + Hono + Drizzle scaffold with `src/{client,server,shared}` layout.
- `YYYY-MM-DD` — Auth surface wired end-to-end (TODO: provider).
- `YYYY-MM-DD` — First typed API contract published in `src/shared/`.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- Strict TypeScript everywhere; one base config, per-side overrides. *Why: consistent rules, side-specific lib/jsx only.*
- `src/client/` cannot import from `src/server/`. Cross-boundary types come from `src/shared/`. *Why: prevents server-only deps and secrets from reaching the bundle.*
- API contracts live in `src/shared/` as Zod schemas. Server validates; client trusts inferred types. *Why: one shape change fails compilation on both sides.*
- Services own all DB and provider-SDK access on the server. *Why: single seam for tests and swaps.*
- Client renders idle/loading/success/error for every async surface. *Why: predictable UX, no silent failures.*
- Single Node process serves API and static client by default. *Why: simplest deploy; revisit when CDN or edge becomes necessary.*
- TODO: client state management choice and reason.
- TODO: server-data caching choice (TanStack Query / SWR / hand-rolled) and reason.
- TODO: auth model (session cookie / bearer / OIDC proxy) and reason.
- TODO: deployment topology (single Node / split / edge) and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: no e2e (Playwright) yet — revisit when first regression escapes unit/component tests.
- TODO: shared schemas only validate happy paths — add error-shape schemas when first 4xx surface needs structured detail.
- TODO: single deploy unit — revisit when client and server scale differently.

## Staged Work

TODO. Next planned chunks, ordered. Keep this short — it is a pointer, not a backlog.
1. TODO
2. TODO
3. TODO

## Refresh Checklist

When this file is updated, also confirm:
- Commands in `.context/engineering-guide.md` still match `package.json`.
- Ownership Map in `.context/project-context.md` still matches `src/` layout.
- Schemas in `src/shared/` still match what the server validates and the client expects. Typecheck across all sides is green.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
