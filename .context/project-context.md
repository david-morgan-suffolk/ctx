# Project Context

## What This Repo Is

`@suffolk/ctx` is a small Bun/TypeScript tool for scaffolding agent-readable context into TypeScript repos.

Core value: new and existing repos should get a consistent `AGENTS.md` plus `.context/` structure that helps agents understand purpose, commands, boundaries, safety, and durable project decisions without inventing facts.

## Architecture

```text
target repo metadata -> scaffold-context.ts -> templates/agent-context -> generated docs
```

The scaffolder reads safe metadata from a target repo, builds a render context, then writes or previews Markdown files. It does not modify target repos unless `--write` is passed.

## Ownership

| Area | Owns |
|------|------|
| `scripts/scaffold-context.ts` | CLI args, metadata detection, workspace detection, template rendering, dry-run/write behavior. |
| `templates/agent-context/` | Generic Markdown skeletons for root agent guide, `.context` files, shim, current focus, and package overlays. |
| `README.md` | Usage examples and naming standard. |
| `AGENTS.md` and `.context/` | Context for this scaffolding repo itself. |

## Current State

- Root standard is `AGENTS.md`.
- `AGENT.md` generation is opt-in via `--agent-shim`.
- Base generated files are `AGENTS.md`, `.context/project-context.md`, `.context/engineering-guide.md`, and `.context/roadmap-notes.md`.
- Optional generation supports `.context/current-focus.md` and workspace package overlays.
- Existing files are skipped unless `--force` is passed.

## Deferred Work

- Add snapshot tests for rendered templates.
- Add fixture repos for Bun package, Node package, and workspace monorepo.
- Add optional config file support for repo-specific template choices.
- Add richer workspace glob support if needed beyond one-level patterns.
