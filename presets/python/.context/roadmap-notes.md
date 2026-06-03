# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial uv + ruff + ty + pytest scaffold.
- `YYYY-MM-DD` — `Settings(BaseSettings)` wired and adopted across modules.
- `YYYY-MM-DD` — First domain module + adapter seam landed.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- `uv` for environment and dependency management. *Why: fast, lockfile-based, single tool replaces venv + pip + pip-tools.*
- `ruff` for lint and format. *Why: one tool, consistent config, fast.*
- `ty` for static type checking, strict. *Why: catches contract drift before tests run.*
- `pytest` for tests, no `unittest.TestCase` subclassing. *Why: fixtures are simpler and more composable.*
- `pydantic-settings` is the **only** path env vars take into the app. *Why: one place to read, validate, and document configuration.*
- Internal data: `@dataclass(frozen=True, slots=True)`. External boundaries: `pydantic.BaseModel`. *Why: type system is enough internally; validation is for trust boundaries.*
- No `unittest.mock.patch` on first-party modules. *Why: if you need it, the code is missing a seam — fix the structure instead.*
- TODO: web framework (FastAPI / Litestar / Starlette / none) and reason.
- TODO: ORM / DB access pattern (SQLAlchemy / SQLModel / raw / none) and reason.
- TODO: sync vs async stance and reason.
- TODO: task runner if any (Celery / RQ / arq / cron) and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: no integration test against a real database — PGlite-equivalent for Postgres is awkward in Python; revisit when contract bugs slip.
- TODO: minimal logging — local stdout for now; revisit when shipping to multiple environments.
- TODO: `ty` configured but not yet at full strict — incremental adoption; track in this file.

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
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
