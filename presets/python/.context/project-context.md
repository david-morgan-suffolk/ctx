# Project Context

Durable architecture and ownership. Update when the shape of the codebase changes, not on every commit.

## What This Repo Is

TODO: one-paragraph description. What this Python codebase does, who runs it (CLI / web service / worker / library), what it depends on.

Default assumption baked into this preset: a typed Python codebase managed with `uv`. Configuration flows through a single `Settings(BaseSettings)` object. Internal data is `@dataclass`; external boundaries use `pydantic.BaseModel`.

## Architecture (Data Flow)

```
entry point (main.py / __main__.py / CLI / app factory)
  → Settings(BaseSettings)  ← env vars (only here)
  → composition root wires services
  → service modules (pure logic + adapters)
  → external I/O (HTTP / DB / files) via narrow adapter classes
  → typed results (@dataclass internally; pydantic at boundaries)
```

Source of truth for runtime config: the `Settings` instance. Source of truth for persistent data: TODO (DB / disk / external service). Domain modules are pure where possible; I/O sits behind adapter seams that can be swapped in tests.

## Ownership Map

| Path | Owns |
|---|---|
| `pyproject.toml` | Package metadata, dependencies, tool config (ruff, ty, pytest). |
| `uv.lock` | Resolved dependency lockfile. |
| `src/<pkg>/__init__.py` | Public surface for the package. Keep narrow. |
| `src/<pkg>/settings.py` | The `Settings(BaseSettings)` class. Only file that reads env. |
| `src/<pkg>/main.py` or `__main__.py` | Composition root. Builds `Settings`, wires services, runs. |
| `src/<pkg>/<domain>/` | Domain modules — value objects, services, adapters. |
| `src/<pkg>/<domain>/adapters/` | I/O seams (HTTP clients, DB repos, file readers). |
| `tests/` | Pytest suite. Mirrors `src/<pkg>/` layout. |
| `tests/conftest.py` | Shared fixtures (no global mutable state). |
| `.context/` | Agent-readable durable context. |
| `README.md` | Human-facing setup, env vars, run commands. |

## Current Product State

TODO: list shipped capabilities and known boundaries. Examples:
- TODO: CLI commands implemented (if a CLI).
- TODO: HTTP endpoints exposed (if a web service — TODO framework).
- TODO: scheduled / triggered jobs (if a worker).

If a feature is mid-flight, prefer `.context/current-focus.md` for the operational details.

## External Integrations

TODO. Document each external system this codebase talks to:
- TODO: database (driver, connection source, migration story).
- TODO: third-party APIs (auth scope, rate limits, retry posture).
- TODO: object storage / message bus.
- TODO: secrets backend (env var / vault / cloud secret manager).

For each: where credentials come from, what is read vs written, what happens on failure.

## Deferred Work

TODO. Things deliberately not built yet, with a one-line reason. Examples:
- TODO: async I/O — sync is sufficient for current throughput.
- TODO: structured logging shipped to a backend — local stdout for now.
- TODO: packaging as a wheel — internal-only for now.

## Non-Goals

- No `os.environ` reads outside `Settings`.
- No mutable module-level state shared across requests/calls.
- No `Any` in domain code. Boundaries may use `dict[str, Any]` only when calling into untyped third-party APIs, and must immediately validate into a typed model.
- No `unittest.mock.patch` on first-party modules. If you reach for it, restructure for dependency injection instead.
- No global database/HTTP clients constructed at import time. Build inside the composition root.
