# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial FastAPI + Pydantic + uv scaffold.
- `YYYY-MM-DD` — `Settings(BaseSettings)` wired and adopted across modules.
- `YYYY-MM-DD` — OpenAPI export entry wired to `app.openapi()`.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- `uv` for environment and dependency management. *Why: fast, lockfile-based, single tool replaces venv + pip + pip-tools.*
- `ruff` for lint and format, `ty` for strict static type checking. *Why: catches contract drift before tests run; one toolchain.*
- FastAPI + Pydantic for the HTTP contract. *Why: validation, OpenAPI generation, and types share one source.*
- Async throughout — no sync I/O in request handling. *Why: mixing sync and async is a maintenance trap; FastAPI is at its best fully async.*
- `pydantic-settings` is the **only** path env vars take into the app. *Why: one place to read, validate, and document configuration.*
- Internal data: `@dataclass(frozen=True, slots=True)`. External boundaries: `pydantic.BaseModel`. *Why: type system is enough internally; validation is for trust boundaries.*
- One `httpx.AsyncClient` per app lifetime, injected via dependency. *Why: connection pooling; testable seam.*
- `app.openapi()` is the authoritative schema. Downstream consumers regenerate from it. *Why: prevents schema drift between code and contract.*
- Errors flow through `app.exception_handler` registrations emitting `application/problem+json`. *Why: predictable client contract; no leaked tracebacks.*
- No in-process persistence. Storage and queues live behind external clients. *Why: this preset is for API services that compose around other systems, not own durable state.*
- No `unittest.mock.patch` on first-party modules. *Why: if you need it, the code is missing a seam — fix the structure instead.*
- TODO: auth model (JWT issuer / session backend / API key / mTLS) and reason.
- TODO: outbound retry posture and reason.
- TODO: deployment target (containers / serverless / managed) and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: no rate limiting — single-tenant launch; revisit before public exposure.
- TODO: OpenAPI not yet published to consumers — manual share for now.
- TODO: minimal logging — local stdout for now; revisit when shipping to multiple environments.

## Staged Work

TODO. Next planned chunks, ordered. Keep this short — it is a pointer, not a backlog.
1. TODO
2. TODO
3. TODO

## Refresh Checklist

When this file is updated, also confirm:
- Commands in `.context/engineering-guide.md` still match `pyproject.toml`.
- Ownership Map in `.context/project-context.md` still matches `src/` layout.
- `Settings` class still validates every env var the app reads. `grep -rn 'os.environ' src/` returns nothing.
- API contract in code still matches what `app.openapi()` declares.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
