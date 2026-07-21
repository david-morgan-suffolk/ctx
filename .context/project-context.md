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

## Durable Decisions

Choices this repo has committed to. Not status or progress — in-flight work and known gaps live in `.context/active/` docs, issues, or PRs, never here.

- `AGENTS.md` is the canonical root guide. `AGENT.md` is an opt-in compatibility shim only (`--agent-shim`), never a duplicate manual.
- One GitHub template repo with a preset chooser, not one template per preset — lower maintenance, single source of truth for presets.
- `init.sh` is dependency-free bash so a freshly-templated repo can run it before installing Node, pnpm, or any toolchain.
- The scaffolder stays runtime-dependency-free (Node stdlib only) until complexity proves a need; `tsx` is a devDep.
- Per-preset devcontainers ride inside `presets/<variant>/.devcontainer/`; `init.sh`'s recursive copy is enough.
- The scaffolder defaults to dry-run, skips existing files unless `--force`, and reads only safe metadata — never secret-bearing files.
- Generated templates leave `TODO:` markers for facts that cannot be inferred safely.
- `.context/` follows the guides-vs-active split (see `.context/README.md`): durable guides at the root, dated ephemeral design docs in `active/`. There is no `roadmap-notes.md`.

## Accepted Limitations

- No snapshot tests yet; `pnpm check` is a runtime smoke check and TypeScript typechecking is not wired.
- Workspace glob support handles common one-level patterns, not full glob semantics.
