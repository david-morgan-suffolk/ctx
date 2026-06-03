# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial Vite + React + FastAPI scaffold with split `web/` and `api/`.
- `YYYY-MM-DD` — `Settings(BaseSettings)` wired in `api/`.
- `YYYY-MM-DD` — OpenAPI → TS client generation pipeline landed.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- API is the contract authority; OpenAPI generates TS types into `web/src/api-client/`. *Why: one source, no manual drift, types match server reality.*
- `shared/openapi.json` is committed. *Why: traceable diffs on contract changes, no surprise regenerations in CI.*
- Web never authors API response types by hand. *Why: divergence becomes silent until production breaks.*
- Strict TypeScript in `web/`; strict `ty` in `api/`. *Why: catches contract drift on both sides at compile time.*
- `Settings(BaseSettings)` is the only env reader in `api/`. *Why: one place to validate and document configuration.*
- Internal Python data: `@dataclass`. External boundary: `pydantic.BaseModel`. *Why: validation belongs at trust boundaries; type system covers internals.*
- Web renders idle/loading/success/error for every async surface. *Why: predictable UX, no silent failures.*
- TODO: deployment topology (same-origin via FastAPI static mount / split CDN + API) and reason.
- TODO: auth scheme (session cookie / bearer token / OIDC proxy) and reason.
- TODO: error envelope shape and reason.
- TODO: pagination model and reason.
- TODO: async vs sync stance in `api/` and reason.
- TODO: web state management choice and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: contract regen is a manual step — revisit when first "forgot to regen" PR ships.
- TODO: no integration tests against a real API — TestClient + MSW for now.
- TODO: single API process — split into worker if any endpoint exceeds request-timeout budget.

## Staged Work

TODO. Next planned chunks, ordered. Keep this short — it is a pointer, not a backlog.
1. TODO
2. TODO
3. TODO

## Refresh Checklist

When this file is updated, also confirm:
- Commands in `.context/engineering-guide.md` still match `api/pyproject.toml` and `web/package.json`.
- Ownership Map in `.context/project-context.md` still matches actual `web/` and `api/` layouts.
- `shared/openapi.json` matches a fresh emit from `api/`. `web/src/api-client/types.ts` matches a fresh generation from that schema.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
