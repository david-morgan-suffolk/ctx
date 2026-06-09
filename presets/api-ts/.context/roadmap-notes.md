# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial Hono + Zod API scaffold.
- `YYYY-MM-DD` — Auth surface wired (TODO: provider).
- `YYYY-MM-DD` — OpenAPI export wired to Zod schemas.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- Strict TypeScript, ESM-first. *Why: matches modern Node, surfaces contract drift early.*
- Hono + `@hono/zod-validator` for routing and validation. *Why: lightweight, runtime-portable, validation and OpenAPI share one source.*
- Zod is the single source of truth for HTTP contracts; internal types derive from `z.infer`. *Why: prevents schema/type drift; OpenAPI generation stays in sync.*
- Route handlers validate and delegate. Business logic lives in services. *Why: keeps HTTP shape separable from domain shape.*
- Services own all outbound HTTP and provider-SDK access. *Why: single seam for testing and for swapping implementations.*
- Errors flow through one centralized middleware emitting `application/problem+json`. *Why: predictable client contract; no leaked stack traces.*
- No in-process persistence. Storage and queues live behind external adapters. *Why: this preset is for API services that compose around other systems, not own durable state.*
- Pino structured logging; no payload bodies in logs. *Why: cheap to ship to any log backend; safe by default.*
- TODO: auth model (JWT / session cookie / mTLS / API key) and reason.
- TODO: outbound retry posture and reason.
- TODO: deployment target (containers / serverless / VM) and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: no rate limiting — single-tenant launch; revisit before public exposure.
- TODO: OpenAPI not yet published to consumers — manual share for now.
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
- API contract in code still matches what the generated OpenAPI / Zod schemas declare.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
