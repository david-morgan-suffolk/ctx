# Engineering Guide

Operational standards for working in this Python repo. Read before changing code.

## Commands

Environment + dependency manager: `uv`. Python version: TODO (pin in `pyproject.toml` `requires-python`).

| Command | Scope |
|---|---|
| `uv sync` | Install/update from `uv.lock`. Creates `.venv/` if missing. |
| `uv run python -m <pkg>` | Run package entry point. |
| `uv run pytest` | Run full test suite. |
| `uv run pytest -k <expr>` | Filter by expression. |
| `uv run pytest tests/<file>` | Run one test file. |
| `uv run ruff check .` | Lint. |
| `uv run ruff check --fix .` | Lint + autofix safe changes. |
| `uv run ruff format .` | Format. |
| `uv run ty check` | Static type check. |
| `uv lock --upgrade` | Refresh `uv.lock` (intentional dep upgrade). |

State command scope exactly. Do not say "tests pass" if `-k` filtered out coverage you needed.

## Python Standards

- `from __future__ import annotations` at the top of every module.
- Type hints on every public function, method, and module-level value. Internal helpers should be typed too unless trivially obvious.
- `ty check` strict. No implicit `Any`. Annotate generics fully (`list[int]`, not `list`).
- Prefer composition over inheritance. Inheritance is for type substitutability, not code reuse.
- No mutable default arguments. No mutable module-level state (constants are fine if truly immutable).
- Imports: stdlib, third-party, first-party — three groups, each sorted. `ruff` enforces.

## Data Contracts

Two kinds of data, two tools:

**Internal value objects** — use `@dataclass`:
```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class UserId:
    value: str
```
- `frozen=True` makes instances hashable and forces explicit replace-via-constructor mutation.
- `slots=True` for memory and to catch typos that would otherwise create stray attributes.
- Internal data does not need runtime validation — the type system covers it.

**External boundaries** — use `pydantic.BaseModel`:
```python
from pydantic import BaseModel, Field

class CreateUserRequest(BaseModel):
    email: str = Field(min_length=3)
    name: str
```
- HTTP request/response bodies, third-party API responses, anything entering the process from outside.
- Validate **once** at the boundary, then convert to internal `@dataclass` for downstream code.

## Settings

`pydantic-settings` is the entry point for all environment variables.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")
    database_url: str
    log_level: str = "INFO"
```

Rules:
- One `Settings` class per app. Constructed exactly once at startup.
- Every env-driven value goes through it. **Never** call `os.environ.get(...)` in domain code.
- Pass the `Settings` instance (or specific fields) explicitly into composition root. Do not import a global.
- In tests, build a `Settings` with overrides or use `monkeypatch.setenv(...)` before constructing.

## Layout

```
src/
  <pkg>/
    __init__.py          # narrow public surface
    __main__.py          # `python -m <pkg>` entry
    settings.py          # Settings(BaseSettings)
    <domain>/
      __init__.py
      models.py          # @dataclass value objects
      services.py        # business logic (pure where possible)
      adapters/          # I/O seams (HTTP / DB / fs)
tests/
  conftest.py            # shared fixtures
  <domain>/
    test_services.py
```

- One package per top-level concern. Avoid deep nesting beyond 2–3 levels.
- `__init__.py` files stay slim — they document what is public, not what exists.
- Adapters are thin: convert in, call out, convert back. No business logic.

## Web / Framework Patterns (Optional)

If this codebase is a web service or worker, follow these:

- HTTP framework TODO (FastAPI / Litestar / Starlette / Flask). Route handlers validate via `BaseModel`, delegate to services, return typed responses.
- Async vs sync: pick one stance per service and stick to it. Mixing is a maintenance trap.
- TODO: ORM (SQLAlchemy / SQLModel / none) — repos hide the ORM behind typed methods.
- TODO: background work (RQ / Celery / arq / cron + script) — workers reuse services; queue is just transport.

## Testing

- Pytest. Test modules mirror `src/<pkg>/` paths.
- Fixtures in `conftest.py`. No global state — every fixture is explicit per-test.
- `tmp_path` for filesystem. `pytest.MonkeyPatch` (via the `monkeypatch` fixture) for env vars.
- **Do not `unittest.mock.patch` first-party modules.** If a test feels like it needs that, the code under test is missing a seam — pass the dependency in instead.
- Third-party SDKs may be patched at their import site, but prefer a thin adapter you can replace with a fake.
- Reset module-level singletons (if any) in fixture teardown. Better: do not have module-level singletons.

## Boundaries

- Services do not parse env or read process state. They take typed config in.
- Adapters do not contain business logic. They translate.
- Domain models do not import from adapters. Dependency arrow points inward.
- `__main__.py` (or the app factory) is the only place that knows about both `Settings` and concrete adapter implementations.

## Safety: Do Not Read

- `.env`, `.env.*` (except `.env.example`)
- `.secrets/`, `secrets.toml`, `.envrc`
- `*.pem`, `*.key`, `*.p12`, `*.pfx`
- Cloud credential files (`~/.aws/credentials`, service account JSON)
- Local DSNs, connection strings, bearer headers checked in by accident
- Tokens, API keys, session cookies pasted into commits
- Provider response payloads that contain user data

Metadata reads are fine: `pyproject.toml`, `uv.lock`, `pytest.ini`, `tox.ini`, `ruff.toml`, and public config files.

Use `.env.example` only for variable names. Preserve unrelated dirty work — never revert files you did not intentionally change.

## Context Maintenance

- Keep `AGENTS.md` compact. Push detail into these files.
- Update `Commands` when `pyproject.toml` scripts change.
- Update `.context/project-context.md` when architecture, integrations, or ownership shift.
- Record framework choices (web framework, ORM, async vs sync, task runner) in `.context/roadmap-notes.md`.
- `.context/current-focus.md` (optional) holds short-lived active-issue notes; delete when resolved.
