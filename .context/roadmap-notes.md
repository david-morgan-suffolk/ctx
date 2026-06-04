# Roadmap Notes

This file keeps durable project knowledge. It is not a task tracker.

## Completed Milestones

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
- Do not read secret-bearing files.
- Default to dry-run and skip existing files.
- Generated templates should include TODOs for facts that cannot be inferred safely.

## Accepted Tech Debt

- No snapshot tests yet.
- Workspace glob support handles common one-level patterns, not full glob semantics.
- TypeScript typechecking is not wired; `pnpm check` is a runtime smoke check.

## Staged Work

1. Add fixture repos and snapshot tests.
2. Add optional config file support for template selection and extra safety paths.
3. Trial against `big-speckle` with `--write --agent-shim` after review.
4. Trial against a monorepo with `--package-overlays` after reviewing generated overlays.
