# Project Context

## What This Repo Is

`@suffolk/ctx` packages reusable agent-context starter material two ways:

1. **GitHub repo template** — clicked from the GitHub UI. Inside the new repo, `./init.sh` picks a preset and copies its `AGENTS.md`, `.context/`, and `.devcontainer/` to the root, then deletes the template scaffolding.
2. **Scaffolder** (`scripts/scaffold-context.ts`, Node + pnpm + `tsx`) — infers context from existing repo metadata when starting from a template is not an option.

Core value: new and existing repos should get a consistent `AGENTS.md` plus `.context/` structure that helps agents understand purpose, commands, boundaries, safety, and durable project decisions without inventing facts. Each preset also ships a matching devcontainer so VS Code / Codespaces boots the right toolchain.

## Architecture

```text
Template flow:    GitHub "Use this template" -> new repo -> ./init.sh --preset X
                  -> copies presets/X/. to root -> removes presets/, scripts/, templates/, self
Scaffolder flow:  target repo metadata -> scaffold-context.ts -> templates/agent-context
                  -> generated docs (dry-run by default; --write to apply)
```

The scaffolder reads safe metadata from a target repo, builds a render context, then writes or previews Markdown files. It does not modify target repos unless `--write` is passed. `init.sh` is a separate, dependency-free bash script that operates inside a templated copy of this repo, not against external targets.

## Ownership

| Area | Owns |
|------|------|
| `init.sh` | Bash applier inside templated repos. Preset menu, copy, scaffolding cleanup, self-delete. |
| `presets/<variant>/` | Stack-tailored starter content: `AGENTS.md`, `.context/*.md`, `.devcontainer/devcontainer.json`. |
| `.devcontainer/` | Devcontainer for the template repo itself (replaced by preset's devcontainer during init). |
| `scripts/scaffold-context.ts` | CLI args, metadata detection, workspace detection, template rendering, dry-run/write behavior. |
| `templates/agent-context/` | Generic Markdown skeletons for root agent guide, `.context` files, shim, current focus, and package overlays. |
| `README.md` | Usage examples and naming standard. |
| `AGENTS.md` and `.context/` | Context for this scaffolding repo itself. |

## Current State

- Repo is usable as a GitHub template. `init.sh` applies a preset and cleans up scaffolding inside the templated copy.
- Each of the 9 presets ships its own `.devcontainer/devcontainer.json` (TS presets: node:22 + pnpm; Python presets: python:3.12 + uv; combo: both).
- Root standard is `AGENTS.md`.
- `AGENT.md` generation is opt-in via `--agent-shim` on the scaffolder.
- Base generated files are `AGENTS.md`, `.context/project-context.md`, `.context/engineering-guide.md`, and `.context/roadmap-notes.md`.
- Optional generation supports `.context/current-focus.md` and workspace package overlays.
- Existing files are skipped unless `--force` is passed.

## Deferred Work

- Add snapshot tests for rendered templates and for `init.sh` applied against each preset.
- Add fixture repos for a single-package Node project and a workspace monorepo.
- Add optional config file support for repo-specific template choices.
- Add richer workspace glob support if needed beyond one-level patterns.
- Add a `.github/workflows/template-bootstrap.yml` that nudges users of freshly-templated repos to run `init.sh`.
