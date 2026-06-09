# ctx

Copy-paste `.context/` starter packs and a small scaffolder for agent-readable repo context.

## Presets

Stack-tailored starting packs under `presets/`. No install, no CLI — just copy.

```bash
cp -r presets/<variant>/. /path/to/new-project/
```

This drops `AGENTS.md` at the project root and `.context/{project-context,engineering-guide,roadmap-notes}.md` alongside. Fill in the `TODO:` markers:

```bash
grep -rn '\bTODO' /path/to/new-project/AGENTS.md /path/to/new-project/.context/
```

| Variant | Pick when |
|---|---|
| `frontend-ts` | React + Vite + Tailwind SPA. No backend in this repo (or backend lives separately). |
| `backend-ts` | Node + Hono + Drizzle + Postgres service. Optional SQS/Redis worker section. |
| `fullstack-ts` | One repo, `src/{client,server,shared}`, React + Hono with shared Zod contracts. |
| `python` | `uv` + `ruff` + `ty` + `pytest`. `pydantic-settings` entry, `@dataclass` internal, `pydantic` at boundaries. |
| `combo-ts-python` | React + Vite frontend (`web/`) and FastAPI backend (`api/`) with OpenAPI-generated TS client. |
| `api-ts` | Node + Hono + Zod HTTP API. No DB layer assumed — storage and queues sit behind external adapters. |
| `api-py` | Python + FastAPI + Pydantic HTTP API. Async, `httpx` outbound, OpenAPI authoritative. No DB layer assumed. |
| `library-ts` | Published TS package or developer CLI tool. ESM, `tsc`-only, runtime-neutral, Changesets, optional `bin`. |
| `library-py` | Published Python package or developer CLI tool. `uv` + `ruff` + `ty` + `pytest` + `hatchling`, `py.typed` shipped, optional `[project.scripts]`. |

## File Shape

Every preset drops the same four files:

- `AGENTS.md` — canonical entrypoint. Compact, operational. Stack, commands, standards, ownership map.
- `.context/project-context.md` — purpose, architecture, ownership, current state, deferred work.
- `.context/engineering-guide.md` — commands, language standards, framework patterns, testing, safety, commits.
- `.context/roadmap-notes.md` — completed milestones, durable decisions, accepted debt, staged work.

`AGENTS.md` is the canonical name. Some tools expect singular `AGENT.md` — generate it as a shim, not the source of truth.

## Scaffolder

When you don't want a preset and would rather infer generic context from an existing repo's metadata:

```bash
pnpm scaffold --target ~/path/to/repo            # dry-run
pnpm scaffold --target ~/path/to/repo --write    # write base files
```

Flags: `--force` overwrites, `--agent-shim` adds `AGENT.md`, `--current-focus` adds the optional scratch file, `--package-overlays` writes small `AGENTS.md` files inside detected workspace packages.

Reads only metadata (`package.json`, `tsconfig*.json`, common config files, workspace manifests). Skips existing files unless `--force`. Leaves `TODO:` markers where it can't infer. Does not read `.env`, `.secrets`, certs, or provider payloads.

See [`AGENTS.md`](AGENTS.md) for repo-internal conventions.
