# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:

- `YYYY-MM-DD` — Initial scaffold (tsc-only ESM, Vitest, Changesets).
- `YYYY-MM-DD` — First published version on npm.
- `YYYY-MM-DD` — Public API surface stabilized; cut `1.0.0`.
- `YYYY-MM-DD` — Optional CLI (`<bin-name>`) shipped behind `bin`.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- Strict TypeScript, ESM-only. *Why: matches modern runtimes; avoids dual-package hazards.*
- `tsc` only — no bundler in the library itself. *Why: ship readable, debuggable, source-mapped modules; let consumers bundle.*
- Runtime-neutral: no `node:*` imports in `src/` (CLI exempt). *Why: usable in Node, browsers, Bun, Deno, workers without forks.*
- Single barrel export (`src/index.ts`). *Why: contract is in one file; deep imports are not promised.*
- `"sideEffects": false`. *Why: enables consumer tree-shaking; forces import-safe modules.*
- No internal logger; no env reads. *Why: the host owns observability and configuration.*
- Changesets for versioning and publishing. *Why: every user-facing change is forced through a release note.*
- TODO: supported runtime matrix (Node LTS list, browser baseline, Bun/Deno stance) and reason.
- TODO: CJS support stance (ESM-only vs dual-build) and reason.
- TODO: peer-dependency strategy (which frameworks are peers vs direct deps) and reason.
- TODO: CLI (yes / no) and, if yes, argv parser choice and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:

- TODO: ESM-only — some consumers still on CJS-only build pipelines; revisit when ≥1 maintained consumer asks.
- TODO: single barrel — no sub-path exports yet; revisit if the public surface grows past ~20 names.
- TODO: no benchmark suite — perf is "good enough" by inspection; revisit if a consumer files a regression.

## Staged Work

TODO. Next planned chunks, ordered. Keep this short — it is a pointer, not a backlog.

1. TODO
2. TODO
3. TODO

## Refresh Checklist

When this file is updated, also confirm:

- Commands in `.context/engineering-guide.md` still match `package.json`.
- Public surface listed in `.context/project-context.md` still matches `src/index.ts`.
- `"exports"`, `"types"`, `"files"`, `"sideEffects"`, `"bin"` in `package.json` still match the documented build shape.
- Supported-runtimes claim in `README.md` still matches what CI proves.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
