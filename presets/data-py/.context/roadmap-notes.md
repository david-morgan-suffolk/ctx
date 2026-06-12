# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial uv + ruff + ty + pytest scaffold.
- `YYYY-MM-DD` — First pipeline (ingest → transform → publish) landed.
- `YYYY-MM-DD` — First published dataset with partition key and idempotent writes.
- `YYYY-MM-DD` — TODO: DABs / dbt project wired (if adopted).

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- `uv` for environment and dependency management. *Why: fast, lockfile-based, single tool replaces venv + pip + pip-tools.*
- `ruff` for lint and format. *Why: one tool, consistent config, fast.*
- `ty` for static type checking, strict. *Why: catches contract drift before tests run.*
- `pytest` for tests, no `unittest.TestCase` subclassing. *Why: fixtures are simpler and more composable.*
- `pydantic-settings` is the **only** path env vars take into the app. *Why: one place to read, validate, and document configuration.*
- Internal data: `@dataclass(frozen=True, slots=True)`. External boundaries: `pydantic.BaseModel`. *Why: type system is enough internally; validation is for trust boundaries.*
- No `unittest.mock.patch` on first-party modules. *Why: if you need it, the code is missing a seam — fix the structure instead.*
- TODO: warehouse / storage target and reason.
- TODO: orchestrator (cron / Airflow / Dagster / Databricks Jobs / dbt Cloud) and reason.
- TODO: dataframe library (pandas / polars / PySpark) and reason.
- TODO: dataframe schema validation tool (pandera / framework-native expectations / none) and reason.
- TODO: stage convention (ingest-transform-publish vs bronze-silver-gold) and reason.
- TODO: transform ownership (Python vs dbt vs SQL files) and reason.
- TODO: idempotency mechanism (overwrite-by-partition vs merge-by-key) and reason.
- TODO: backfill mechanism (CLI partition-range args / orchestrator-driven) and reason.
- TODO: notebook stance (none / thin wrappers in `notebooks/`) and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: no data-quality monitoring beyond boundary validation — revisit when a bad load slips through.
- TODO: backfills are manual via CLI args — revisit when partition count grows.
- TODO: no schema registry / contract versioning with upstream producers — revisit on first breaking upstream change.

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
- Every published dataset still documents its partition key and idempotency mechanism.
- `tests/fixtures/` still represent current source shapes.
- If Databricks: `databricks.yml` targets still match real workspaces/catalogs.
- If dbt: `sources.yml` still matches what Python ingestion actually produces.
