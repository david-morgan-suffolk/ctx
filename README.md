# ctx

Agent-readable repo context, packaged two ways:

1. A **GitHub template** — click "Use this template", run `./init.sh`, pick a preset, get a clean repo with `.context/`, `AGENTS.md`, and a matching devcontainer.
2. A **scaffolder** — drop the same context into an existing repo by reading its metadata, no template required.

## Use as a GitHub Template

On this repo's GitHub page, click **Use this template → Create a new repository**. In the new repo:

```bash
./init.sh                 # interactive: pick a preset from the menu
./init.sh --preset api-ts # or pick up-front
```

`init.sh` copies the chosen preset's `AGENTS.md`, `.context/`, and `.devcontainer/` to the repo root, then deletes `presets/`, `scripts/`, `templates/`, `package.json`, and itself. What's left is your new repo.

After:

```bash
grep -rn TODO .context/ AGENTS.md      # fill in markers
git add -A && git commit -m "init from ctx-template"
```

Open in VS Code or Codespaces and "Reopen in Container" to get the preset's toolchain (Node + pnpm, Python + uv, or both).

**Maintainer note:** mark this repo as a template in GitHub → Settings → General → "Template repository".

## Presets

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
| `data-py` | Python data pipelines: `uv` + `ruff` + `ty` + `pytest`, ingest→transform→publish, idempotent partitioned writes. Optional Databricks (DABs, Lakeflow/DLT, Unity Catalog) and dbt + SQL warehouse sections. |

Each preset drops these files plus a devcontainer:

- `AGENTS.md` — canonical entrypoint. Compact, operational. Stack, commands, standards, ownership map.
- `.context/README.md` — conventions for `.context/`: durable guides vs. ephemeral `active/` docs.
- `.context/project-context.md` — purpose, architecture, ownership, durable decisions.
- `.context/engineering-guide.md` — commands, language standards, framework patterns, testing, safety, commits.
- `.context/writing-tdds.md` — how to write a Technical Design Document for the repo.
- `.context/active/` — dated in-flight design docs (`YYYYMMDD-<title>.md`); the PR that lands the work deletes the doc. Guides never carry progress.
- `.devcontainer/devcontainer.json` — VS Code / Codespaces dev environment for that stack.

`.context/` uses a two-tier lifecycle: durable **guides** at the root never describe progress, and ephemeral **active docs** carry in-flight design and are deleted when their work lands. See `.context/README.md` in any preset.

`AGENTS.md` is the canonical name. Some tools expect singular `AGENT.md` — generate it as a shim, not the source of truth.

## Adding context to an existing repo

For repos you can't reasonably re-create from a template, the scaffolder infers generic context from existing metadata:

```bash
pnpm scaffold --target ~/path/to/repo            # dry-run
pnpm scaffold --target ~/path/to/repo --write    # write base files
```

Flags: `--force` overwrites, `--agent-shim` adds `AGENT.md`, `--package-overlays` writes small `AGENTS.md` files inside detected workspace packages. The base run always creates the `.context/` guides plus an empty, tracked `.context/active/` folder for dated in-flight design docs.

Reads only metadata (`package.json`, `tsconfig*.json`, common config files, workspace manifests). Skips existing files unless `--force`. Leaves `TODO:` markers where it can't infer. Does not read `.env`, `.secrets`, certs, or provider payloads.

See [`AGENTS.md`](AGENTS.md) for repo-internal conventions.
