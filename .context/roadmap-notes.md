# Roadmap Notes

This file keeps durable project knowledge. It is not a task tracker.

## Completed Milestones

### v0.2 GitHub Template + Devcontainers

Shipped 2026-06-09.

Delivered:

- `init.sh` at repo root: bash, zero deps, interactive preset menu or `--preset <name>`. Copies preset to root, removes `presets/`, `scripts/`, `templates/`, `package.json`, `pnpm-lock.yaml`, the template's own `.context/` + `AGENTS.md` + `README.md`, and self.
- Per-preset `.devcontainer/devcontainer.json` for all 9 presets: TS presets on `typescript-node:1-22` with pnpm via corepack; Python presets on `python:1-3.12` with `uv` via pipx; combo on TS base + Python feature.
- Template-self `.devcontainer/devcontainer.json` at repo root for developing on the template itself.
- README restructured to lead with the template flow; scaffolder section retained for the existing-repo use case.

### v0.1 Agent Context Scaffolder

Shipped 2026-05-14.

Delivered:

- Node + pnpm + TypeScript scaffold CLI (TS via `tsx`) with dry-run default.
- Generic templates for root `AGENTS.md`, optional `AGENT.md`, `.context` files, current focus notes, and package overlays.
- Metadata detection for package manager, scripts, TypeScript config, common config files, and workspace packages.
- README usage examples and naming standard.
- Self-context for this repo.

## Durable Decisions

- Use `AGENTS.md` as canonical.
- Generate `AGENT.md` only as opt-in compatibility shim.
- Keep scaffolder dependency-free until complexity proves a need.
- `init.sh` is bash so a freshly-templated repo can run it before installing Node, pnpm, or any toolchain.
- One GitHub template repo with a preset chooser, not one template per preset. Lower maintenance, single source of truth for presets.
- Per-preset devcontainers ride inside `presets/<variant>/.devcontainer/`. `init.sh`'s recursive copy is enough — no per-preset wiring needed.
- Do not read secret-bearing files.
- Default to dry-run and skip existing files.
- Generated templates should include TODOs for facts that cannot be inferred safely.

## Accepted Tech Debt

- No snapshot tests yet.
- Workspace glob support handles common one-level patterns, not full glob semantics.
- TypeScript typechecking is not wired; `pnpm check` is a runtime smoke check.

## Staged Work

1. Mark this repo as a GitHub template in Settings → General.
2. Trial template flow end-to-end: "Use this template" → `./init.sh --preset library-ts` in a real GitHub-created repo.
3. Add fixture repos and snapshot tests for both `init.sh` and the scaffolder.
4. Add `.github/workflows/template-bootstrap.yml` that detects a freshly-templated repo and posts an issue prompting `./init.sh`.
5. Add optional config file support for template selection and extra safety paths.
6. Trial against `big-speckle` with `--write --agent-shim` after review.
7. Trial against a monorepo with `--package-overlays` after reviewing generated overlays.
