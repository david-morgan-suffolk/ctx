# Agent Guide

## Project Context

`@suffolk/ctx` provides reusable agent-context templates and a Node + pnpm TypeScript scaffolder for TypeScript repos.

Additional durable context lives in `.context/`:

- `.context/project-context.md` - purpose, architecture, ownership, current state, and deferred work.
- `.context/engineering-guide.md` - commands, TypeScript style, template rules, testing, and safety.
- `.context/roadmap-notes.md` - milestones, decisions, accepted debt, and staged work.

## Repo Shape

| Path | Owns |
|------|------|
| `scripts/scaffold-context.ts` | CLI that detects repo metadata and renders context templates. |
| `templates/agent-context/` | Markdown templates for root, context, shim, current-focus, and package overlay files. |
| `README.md` | User-facing usage and standard explanation. |

## Commands

Use pnpm. TypeScript runs via `tsx`.

- `pnpm check` - runs scaffold help smoke check.
- `pnpm scaffold --target <repo>` - dry-run scaffold for a target repo.
- `pnpm scaffold --target <repo> --write` - write base scaffold files.

## Standards

- `AGENTS.md` is canonical. `AGENT.md` is optional compatibility shim only.
- Templates must stay generic and leave TODOs for unknown project-specific facts.
- Script must default to dry-run and skip existing files unless `--force` is passed.
- Detection must use repo metadata, not secret-bearing files.
- Keep templates ASCII, compact, and source-backed.

## Safety

- Do not read or copy `.env`, `.secrets`, local params, copied certs, bearer headers, database URLs, DSNs, AWS secrets, or local credential values.
- Do not make scaffolder read broad source trees unless needed; prefer metadata files and existence checks.
- Preserve unrelated dirty work. Never revert files you did not intentionally change.

Search scope, settings discipline, and commit style live in [`.context/engineering-guide.md`](.context/engineering-guide.md).

## Where To Edit

- CLI behavior: `scripts/scaffold-context.ts`.
- Generated text: `templates/agent-context/*.tmpl`.
- Usage docs: `README.md`.
- Durable project context: `.context/*.md`.
