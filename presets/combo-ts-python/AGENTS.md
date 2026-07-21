# AGENTS.md

Canonical agent entry for this repo. Compact and operational. Deeper durable context lives in `.context/`.

## Project Context

- [.context/project-context.md](.context/project-context.md) — what this app is, architecture, ownership map, integrations, durable decisions.
- [.context/engineering-guide.md](.context/engineering-guide.md) — commands, language standards, cross-language contract rules, safety.
- [.context/writing-tdds.md](.context/writing-tdds.md) — how to write a Technical Design Document for this repo.
- [.context/README.md](.context/README.md) — `.context/` conventions: durable guides vs. ephemeral `active/` design docs (`YYYYMMDD-<title>.md`, deleted when the work lands).

## Stack

Split repo: `web/` (React + Vite + TypeScript frontend) and `api/` (FastAPI + uv Python backend). The API is the source of truth for contracts; FastAPI emits `openapi.json` which generates a typed TypeScript client in `web/`. One direction.

## Commands

Web (`web/`): package manager TODO (pnpm / npm).
API (`api/`): `uv`.

```
# api
cd api
uv sync
uv run uvicorn <pkg>.main:app --reload --port 8000
uv run pytest
uv run ruff check .
uv run ty check
uv run python -m <pkg>.scripts.emit_openapi > ../shared/openapi.json

# web
cd web
<pkg> install
<pkg> run dev                  # vite, proxies /api -> http://localhost:8000
<pkg> run gen:api              # openapi-typescript ../shared/openapi.json -> src/api-client/types.ts
<pkg> run typecheck
<pkg> run lint
<pkg> run build
<pkg> run test
```

Cite exact script scope. Do not claim a command runs every test unless the relevant manifest proves it.

## Standards

- API is the contract authority. FastAPI `pydantic.BaseModel` request/response models → `openapi.json` → generated TS types in `web/src/api-client/`. Web never edits the generated file by hand.
- Strict TypeScript in `web/`. Same `frontend-ts` rules: idle/loading/success/error on every async surface, controlled forms, no backend secrets in the bundle.
- Strict Python in `api/`. Same `python` rules: `Settings(BaseSettings)` is the only env path, `@dataclass` internal, `BaseModel` at boundaries.
- Dev: Vite proxies `/api` to the FastAPI port. In production: choose between same-origin (FastAPI serves the built bundle) or split-origin (web on CDN, API behind a separate host) — document in `.context/project-context.md`.

## Safety

Do not read `.env`, `.secrets`, certs, tokens, DSNs, cloud credentials. Full list in `.context/engineering-guide.md`. Use `.env.example` for variable names only.

Search scope, settings discipline, and commit style live in [`.context/engineering-guide.md`](.context/engineering-guide.md).

## Where To Edit

| File | Owns |
|---|---|
| `web/src/` | React app, UI state, typed API client. |
| `web/src/api-client/types.ts` | **Generated.** Do not hand-edit. Re-run `<pkg> run gen:api`. |
| `web/src/api-client/index.ts` | Hand-written wrapper around `fetch` that uses generated types. |
| `api/src/<pkg>/` | FastAPI routes, services, models, settings. |
| `api/src/<pkg>/main.py` | App factory + composition root. |
| `api/src/<pkg>/settings.py` | `Settings(BaseSettings)`. |
| `shared/openapi.json` | API contract artifact, emitted from FastAPI. Committed. |
| `.context/` | Durable architecture, decisions, debt. |
| `AGENTS.md` | This file. Keep compact; push detail into `.context/`. |

## Maintenance

After any API model change: emit `openapi.json`, regenerate web types, commit both. Update `Commands` here when scripts change in either side. Record cross-language contract decisions (auth scheme, error envelope, pagination model) in `.context/project-context.md`.
