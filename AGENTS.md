# Agent Guide

## Project Context

`@suffolk/ctx` provides reusable agent-context templates packaged two ways: as a **GitHub repo template** (click "Use this template" → run `./init.sh` → pick a preset) and as a **Node + pnpm TypeScript scaffolder** for adding context into existing repos.

Additional durable context lives in `.context/` (conventions in `.context/README.md`):

- `.context/project-context.md` - purpose, architecture, ownership, and durable decisions.
- `.context/engineering-guide.md` - commands, TypeScript style, template rules, testing, and safety.
- `.context/writing-tdds.md` - how to write a Technical Design Document for this repo.
- `.context/active/` - dated in-flight design docs (`YYYYMMDD-<title>.md`); the PR that lands the work deletes the doc. Guides never carry progress.

## Repo Shape

| Path | Owns |
|------|------|
| `init.sh` | Bash applier run inside a templated repo. Picks a preset, copies it to root, deletes template scaffolding. |
| `presets/<variant>/` | Stack-tailored starter packs. Each contains `AGENTS.md`, `.context/`, and `.devcontainer/`. |
| `.devcontainer/` | Devcontainer for the template repo itself (removed by `init.sh` in templated copies). |
| `scripts/scaffold-context.ts` | CLI that detects repo metadata and renders context templates for existing repos. |
| `templates/agent-context/` | Markdown templates for root, context guides (incl. `.context/README.md` conventions and `writing-tdds.md`), shim, and package overlay files. |
| `README.md` | User-facing usage and standard explanation. |

## Commands

Use pnpm. TypeScript runs via `tsx`.

- `pnpm check` - runs scaffold help smoke check.
- `pnpm scaffold --target <repo>` - dry-run scaffold for a target repo.
- `pnpm scaffold --target <repo> --write` - write base scaffold files.

## Standards

- `AGENTS.md` is canonical. `AGENT.md` is optional compatibility shim only.
- Templates and presets must stay generic and leave TODOs for unknown project-specific facts.
- `init.sh` must be dependency-free bash, work in non-interactive mode via `--preset`, and never overwrite a user's `.context/` without `--force`.
- Scaffolder must default to dry-run and skip existing files unless `--force` is passed.
- Detection must use repo metadata, not secret-bearing files.
- Keep templates ASCII, compact, and source-backed.

## Safety

- Do not read or copy `.env`, `.secrets`, local params, copied certs, bearer headers, database URLs, DSNs, AWS secrets, or local credential values.
- Do not make scaffolder read broad source trees unless needed; prefer metadata files and existence checks.
- Preserve unrelated dirty work. Never revert files you did not intentionally change.

Search scope, settings discipline, and commit style live in [`.context/engineering-guide.md`](.context/engineering-guide.md).

## Where To Edit

- Template-applier behavior: `init.sh`.
- Preset content: `presets/<variant>/{AGENTS.md,.context/*,.devcontainer/devcontainer.json}`.
- Scaffolder CLI behavior: `scripts/scaffold-context.ts`.
- Scaffolder-generated text: `templates/agent-context/*.tmpl`.
- Usage docs: `README.md`.
- Durable project context: `.context/*.md`.
