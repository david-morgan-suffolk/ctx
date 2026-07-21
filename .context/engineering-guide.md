# Engineering Guide

## Commands

Use pnpm. TypeScript runs via `tsx` (devDep).

- `pnpm check` - executes `scripts/scaffold-context.ts --help` as a parse/runtime smoke check.
- `pnpm scaffold --target <repo>` - dry-runs scaffold generation.
- `pnpm scaffold --target <repo> --write` - writes scaffold files.
- `pnpm scaffold --target <repo> --write --force` - overwrites existing scaffold paths.

Validation examples:

```bash
pnpm scaffold --target /Users/david/suffolk/big-speckle --agent-shim
pnpm scaffold --target /Users/david/suffolk/big --package-overlays
```

## TypeScript

- Keep `scripts/scaffold-context.ts` dependency-free at runtime; use Node standard library APIs only. `tsx` is a devDep that runs the file — it does not become a runtime dependency.
- Keep template keys explicit and simple: `{{key}}` replacement only.
- Prefer small helpers over adding a templating dependency.
- Keep output Markdown deterministic except intentional `generatedDate`.

## Template Rules

- Use `AGENTS.md` as canonical root guide.
- Keep `AGENT.md` as a tiny compatibility shim, not a duplicate manual.
- Root guide should be compact and operational.
- `.context/project-context.md` should hold architecture, ownership, and durable decisions.
- `.context/engineering-guide.md` should hold commands, style, tests, and safety.
- `.context/writing-tdds.md` is the TDD authoring guide; `.context/README.md` documents the guides-vs-active split.
- `.context/active/` holds dated in-flight design docs; the PR that lands the work deletes them. Guides never carry progress or status.
- Package overlays should say "Read root AGENTS.md first" and avoid duplicating broad guidance.

## Search Scope

When grepping, finding, or reading within the repo, exclude dependency, cache, and build output. They pollute results, slow `find`, and contain no source-of-truth content.

- `node_modules/`
- `dist/`
- `coverage/`
- `.tsbuildinfo`

Examples (the `rg -g` globs are only needed when running outside the repo's `.gitignore` scope, e.g. with `--no-ignore`):

```bash
rg --hidden -g '!{node_modules,dist,coverage}/**' '<pattern>'
find . -type d \( -name node_modules -o -name dist -o -name coverage \) -prune -o -type f -print
```

Metadata reads inside excluded dirs are fine when the file itself is the source of truth (e.g. `pnpm-lock.yaml`).

## Settings

All CLI args and environment variables flow through a single typed parser, not scattered reads of `process.env` / `process.argv` across the codebase.

- The scaffolder declares its flags in one place at the top of `scripts/scaffold-context.ts`. Downstream functions take the parsed options as typed parameters.
- New flags or env reads go through that parser. No inline `process.env.X` in detection or template-rendering code.
- Defaults live next to the parser; tests override by constructing the options object directly.

## Safety

- Do not read `.env`, `.secrets`, local params, copied certs, bearer headers, database URLs, DSNs, AWS secrets, or local credential values.
- Metadata reads are allowed for `package.json`, `tsconfig*.json`, known config filenames, and workspace package manifests.
- Dry-run must remain default.
- Writes must skip existing files unless `--force` is explicit.

## Commits

- **One concern per commit.** Do not bundle a refactor with a feature with a dep bump.
- **Subject ≤ 72 chars, imperative mood.** Conventional prefix when useful (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
- **Body explains *why*, not *what*.** The diff shows what.
- **Generated artifacts ride with their source change.** Template edits commit with any scaffolder change that depends on them.
- **Never commit secrets.** Real tokens, DSNs, bearer headers, cloud credentials. `.env.example` is for variable names only.
- **Preserve unrelated dirty work.** Never restage or revert files you did not intentionally touch.

## Local Agent Scratch

Agents drop transient working files at repo root while in the middle of a task: `PLAN.md`, `TODO.md`, `NOTES.md`, `SCRATCH.md`. These reflect one session's in-flight reasoning. They are not durable design docs and should not enter git.

Add to `.gitignore`:

```
PLAN.md
TODO.md
NOTES.md
SCRATCH.md
```

- `AGENTS.md` is **durable** and stays committed. It is the canonical entrypoint, not scratch — do not add it to `.gitignore`.
- Durable architecture, decisions, and caveats belong in `.context/` (committed). Scratch belongs at root (ignored).
- A plan worth keeping graduates into a dated design doc under `.context/active/` (see `.context/README.md`) or into the PR description before the scratch file is discarded. Do not park it in a root scratch file.

## Testing

Current validation is smoke-level only. Use `pnpm check` plus dry-runs against known repos.

Future tests should use temp fixture repos and assert planned paths plus rendered content snapshots.
