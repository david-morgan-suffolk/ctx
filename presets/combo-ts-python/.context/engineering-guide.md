# Engineering Guide

Operational standards for working in this combo repo. Read before changing code.

## Commands

`web/` uses TODO (pnpm / npm / bun). `api/` uses `uv`. Examples below use `<pkg>` for the web package manager.

### API (`api/`)

| Command | Scope |
|---|---|
| `uv sync` | Install/update from `uv.lock`. |
| `uv run uvicorn <pkg>.main:app --reload --port 8000` | Dev server with reload. |
| `uv run pytest` | Run tests. |
| `uv run ruff check .` | Lint. |
| `uv run ruff format .` | Format. |
| `uv run ty check` | Static type check. |
| `uv run python -m <pkg>.scripts.emit_openapi > ../shared/openapi.json` | Emit contract artifact. |

### Web (`web/`)

| Command | Scope |
|---|---|
| `<pkg> install` | Install deps. |
| `<pkg> run dev` | Vite dev server. Proxies `/api` → `http://localhost:8000`. |
| `<pkg> run gen:api` | `openapi-typescript ../shared/openapi.json -o src/api-client/types.ts` (or your generator of choice). |
| `<pkg> run typecheck` | `tsc --noEmit`. |
| `<pkg> run lint` | Biome or ESLint. |
| `<pkg> run build` | Production bundle to `dist/`. |
| `<pkg> run test` | Vitest. |

State command scope precisely. "Tests pass" means the suite you actually ran.

## The Contract (Source of Truth)

The pydantic models in `api/src/<pkg>/models/` are the **only** authoritative source of the API shape.

Flow:

1. Edit / add a pydantic `BaseModel` in `api/`.
2. Run `uv run python -m <pkg>.scripts.emit_openapi > ../shared/openapi.json`.
3. From `web/`, run `<pkg> run gen:api` to refresh `web/src/api-client/types.ts`.
4. Commit `models/`, `shared/openapi.json`, and the generated types together.

Rules:

- The web client **never** authors a type that overlaps with an API response shape. Always pull from generated types.
- If you find yourself patching `types.ts` by hand to fix a TS error, the fix belongs in the pydantic model (or the route's `response_model`). Regenerate.
- Treat `shared/openapi.json` as a build artifact that is also a contract — committed for traceability, regenerated on every model change.

## API (Python) Standards

Inherit the rules from the standalone `python` preset (this file is a subset). Highlights:

- `from __future__ import annotations` at module top. Type hints on everything public.
- `ty check` strict. No implicit `Any`.
- `Settings(BaseSettings)` is the only env reader. Constructed once in app factory. Never `os.environ.get` in business logic.
- Internal data: `@dataclass(frozen=True, slots=True)`. External boundary: `pydantic.BaseModel`.
- FastAPI route handlers validate inputs (path/query/body), delegate to services, return typed `response_model`.
- Services own DB and external-SDK calls. Routes do not.
- Async vs sync: pick one stance per service. If you use `def` handlers, FastAPI runs them on a threadpool; if `async def`, the whole stack must be async-aware.

## Web (TypeScript) Standards

Inherit the rules from the standalone `frontend-ts` preset. Highlights:

- Strict TypeScript. No implicit `any`.
- React + Vite + Tailwind. shadcn/Radix primitives.
- `react-hook-form` + Zod resolver for forms. Validate against shapes derived from the generated types where possible.
- Every async surface renders idle/loading/success/error explicitly.
- API client (`web/src/api-client/index.ts`) is a thin `fetch` wrapper that consumes generated types. No business logic.
- TODO: state management library (MobX / Zustand / Context).
- TODO: server-data caching (TanStack Query / SWR / hand-rolled).

## Dev Loop

- Two terminals: `cd api && uv run uvicorn ...` and `cd web && <pkg> run dev`.
- Vite proxies `/api` to the FastAPI port. Web fetches `/api/...` and never knows the API origin in dev.
- When you change a pydantic model: regenerate `shared/openapi.json` and `web/src/api-client/types.ts` before web typechecks.

## Build & Deploy

Default: TODO. Choose one of:

- **Same-origin**: FastAPI mounts the built `web/dist/` as static files. Single deploy artifact.
- **Split-origin**: web on a CDN, API on a separate host. CORS configured explicitly in FastAPI. `VITE_API_BASE_URL` injected at build time.

Document the choice in `.context/roadmap-notes.md` and reflect it in `web/vite.config.ts` and the API's static-mount config.

## Auth & Error Envelope

TODO. Pick once and document:

- Auth: TODO (session cookie / bearer token / OIDC proxy headers). Whichever, expose a JSON endpoint the web client uses to derive logged-in state. Do not duplicate auth state in client storage.
- Error envelope: a single error response shape across all endpoints (`{ "error": { "code": ..., "message": ... } }`). Define it as a pydantic model so it appears in the OpenAPI schema and ends up in generated TS types.

## Testing

- API: pytest. Use `TestClient` from `fastapi.testclient` or `httpx.AsyncClient`. DB tests use a real Postgres (containerized) or sqlite for unit-level. Mock the network at adapter seams, not inside service methods.
- Web: Vitest + jsdom for components. MSW for fetch mocking, fed by the generated types so tests stay in sync.
- Contract: optional snapshot test that the committed `shared/openapi.json` matches a fresh emit. Catches forgotten regeneration in PRs.

## Safety: Do Not Read

- `.env`, `.env.*` (except `.env.example`)
- `.secrets/`, `secrets.toml`, `.envrc`
- `*.pem`, `*.key`, `*.p12`, `*.pfx`
- Cloud credential files (`~/.aws/credentials`, service account JSON)
- Local DSNs, connection strings, bearer headers checked in by accident
- Tokens, API keys, session cookies pasted into commits
- Provider response payloads that contain user data

Metadata reads are fine: `pyproject.toml`, `uv.lock`, `package.json`, `tsconfig*.json`, lock files, `vite.config.ts`, `ruff.toml`, `pytest.ini`, and `shared/openapi.json`.

Use `.env.example` only for variable names. Preserve unrelated dirty work — never revert files you did not intentionally change.

## Context Maintenance

- Keep `AGENTS.md` compact. Push detail into these files.
- Update `Commands` when scripts change in either side.
- Update `.context/project-context.md` when architecture, integrations, or ownership shift.
- Every API model change triggers contract regen. If you change `models/` without committing the new `openapi.json` and `types.ts`, the contract drifts silently — treat that as a bug.
- Record durable cross-language decisions (deploy topology, auth scheme, error envelope, pagination model) in `.context/roadmap-notes.md`.
- `.context/current-focus.md` (optional) holds short-lived active-issue notes; delete when resolved.
