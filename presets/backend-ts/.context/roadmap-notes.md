# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial Hono + Drizzle + Postgres scaffold.
- `YYYY-MM-DD` — Auth surface wired (TODO: provider).
- `YYYY-MM-DD` — First worker pipeline landed (TODO: name).

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- Strict TypeScript, ESM-first. *Why: matches modern Node, surfaces contract drift early.*
- Route handlers validate with Zod and delegate. Business logic lives in services. *Why: keeps HTTP shape separable from domain shape.*
- Drizzle schema in `src/db/schema.ts` is the source of truth; migrations are generated, not hand-written. *Why: prevents schema drift between code and DB.*
- Services own all DB and provider-SDK access. *Why: single seam for testing and for swapping implementations.*
- Workers (if present) reuse services. *Why: API and worker stay consistent; one place to fix bugs.*
- Pino structured logging; no payload bodies in logs. *Why: cheap to ship to any log backend; safe by default.*
- TODO: auth model (session cookie / bearer / mTLS) and reason.
- TODO: queue choice (SQS / BullMQ / none) and reason.
- TODO: deployment target (containers / serverless / VM) and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: no rate limiting — single-tenant launch; revisit before public exposure.
- TODO: minimal e2e coverage — integration tests cover service-level paths for now.
- TODO: secret rotation not automated — manual until ops team picks a vault.

## Staged Work

TODO. Next planned chunks, ordered. Keep this short — it is a pointer, not a backlog.
1. TODO
2. TODO
3. TODO

## Refresh Checklist

When this file is updated, also confirm:
- Commands in `.context/engineering-guide.md` still match `package.json`.
- Ownership Map in `.context/project-context.md` still matches `src/` layout.
- API contract in code still matches what the OpenAPI / Zod schemas declare.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
