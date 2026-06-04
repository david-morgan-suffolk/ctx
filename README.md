# ctx

Agent context scaffolding for TypeScript repos, plus copy-paste `.context/` starter packs for fresh projects.

## Presets

Stack-tailored starting `.context/` packs under `presets/`. Use these when starting a new project with a known stack — no install, no CLI, just copy.

```bash
cp -r presets/<variant>/. /path/to/new-project/
```

This drops `AGENTS.md` at the project root and `.context/{project-context,engineering-guide,roadmap-notes}.md` alongside. Edit the `TODO:` markers — `grep -rn '\bTODO' /path/to/new-project/AGENTS.md /path/to/new-project/.context/` lists every blank.

| Variant | Pick when |
|---|---|
| `frontend-ts` | React + Vite + Tailwind SPA. No backend in this repo (or backend lives separately). |
| `backend-ts` | Node + Hono + Drizzle + Postgres service. Optional SQS/Redis worker section. |
| `fullstack-ts` | One repo, `src/{client,server,shared}`, React + Hono with shared Zod contracts. |
| `python` | `uv` + `ruff` + `ty` + `pytest`. `pydantic-settings` entry, `@dataclass` internal, `pydantic` at boundaries. |
| `combo-ts-python` | React + Vite frontend (`web/`) and FastAPI backend (`api/`) with OpenAPI-generated TS client. |
| `library-ts` | Published TS package or developer CLI tool. ESM, `tsc`-only, runtime-neutral, Changesets, optional `bin`. |
| `library-py` | Published Python package or developer CLI tool. `uv` + `ruff` + `ty` + `pytest` + `hatchling`, `py.typed` shipped, optional `[project.scripts]`. |

Presets are static, hand-tuned content. The scaffolder below is a separate track for inferring generic context from an existing repo's metadata.

## Standard

Use `AGENTS.md` as the canonical root guide. Generate `AGENT.md` only as a compatibility shim when a tool expects singular naming.

Generated base files:

- `AGENTS.md`
- `.context/project-context.md`
- `.context/engineering-guide.md`
- `.context/roadmap-notes.md`

Optional files:

- `AGENT.md` with `--agent-shim`
- `.context/current-focus.md` with `--current-focus`
- package-local `AGENTS.md` files with `--package-overlays`

## Usage

Dry run against a repo:

```bash
pnpm scaffold --target ~/suffolk/big-speckle
```

Write base context files:

```bash
pnpm scaffold --target ~/suffolk/big-speckle --write
```

Write base files plus a singular shim:

```bash
pnpm scaffold --target ~/suffolk/big-speckle --write --agent-shim
```

Write package overlays for detected workspaces:

```bash
pnpm scaffold --target ~/suffolk/big --write --package-overlays
```

Overwrite existing generated paths:

```bash
pnpm scaffold --target ~/suffolk/my-repo --write --force
```

## Behavior

- Defaults to dry-run. Add `--write` to change files.
- Skips existing files unless `--force` is passed.
- Reads only repo metadata: `package.json`, `tsconfig*.json`, common config filenames, and workspace package manifests.
- Does not read `.env`, `.secrets`, local params, certs, or provider payload dumps.
- Uses detected scripts and package manager names instead of inventing commands.
- Leaves TODO markers where project-specific context needs human input.

## Template Shape

Root `AGENTS.md` is the compact entrypoint agents should read first. `.context/` holds durable, larger context split by purpose:

- `project-context.md`: purpose, architecture, ownership, current state, deferred work.
- `engineering-guide.md`: commands, TypeScript style, tests, boundaries, safety.
- `roadmap-notes.md`: milestones, durable decisions, accepted debt, next staged work.
- `current-focus.md`: optional short-lived operational notes.

Package overlays should stay small. They point back to root `AGENTS.md` and add only local ownership, path maps, commands, tests, and caveats.
