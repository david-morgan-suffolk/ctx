# Engineering Guide

## Commands

Use Bun.

- `bun run check` - executes `scripts/scaffold-context.ts --help` as a parse/runtime smoke check.
- `bun run scaffold -- --target <repo>` - dry-runs scaffold generation.
- `bun run scaffold -- --target <repo> --write` - writes scaffold files.
- `bun run scaffold -- --target <repo> --write --force` - overwrites existing scaffold paths.

Validation examples:

```bash
bun run scaffold -- --target /Users/david/suffolk/big-speckle --agent-shim --current-focus
bun run scaffold -- --target /Users/david/suffolk/big --package-overlays
```

## TypeScript

- Keep `scripts/scaffold-context.ts` dependency-free; use Node standard library APIs only.
- Keep runtime compatible with Bun, but avoid Bun-only APIs unless there is a clear benefit.
- Keep template keys explicit and simple: `{{key}}` replacement only.
- Prefer small helpers over adding a templating dependency.
- Keep output Markdown deterministic except intentional `generatedDate`.

## Template Rules

- Use `AGENTS.md` as canonical root guide.
- Keep `AGENT.md` as a tiny compatibility shim, not a duplicate manual.
- Root guide should be compact and operational.
- `.context/project-context.md` should hold architecture and ownership.
- `.context/engineering-guide.md` should hold commands, style, tests, and safety.
- `.context/roadmap-notes.md` should hold durable decisions and accepted debt.
- Package overlays should say "Read root AGENTS.md first" and avoid duplicating broad guidance.

## Search Scope

When grepping, finding, or reading within the repo, exclude dependency, cache, and build output. They pollute results, slow `find`, and contain no source-of-truth content.

- `node_modules/`
- `dist/`
- `.bun/`
- `coverage/`
- `.tsbuildinfo`

Examples:

```bash
rg --hidden -g '!{node_modules,dist,.bun,coverage}/**' '<pattern>'
find . -type d \( -name node_modules -o -name dist -o -name .bun -o -name coverage \) -prune -o -print
```

Metadata reads inside excluded dirs are fine when the file itself is the source of truth (e.g. `bun.lock`).

## Settings

All CLI args and environment variables flow through a single typed parser, not scattered reads of `process.env` / `Bun.env` / `process.argv` across the codebase.

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

## Testing

Current validation is smoke-level only. Use `bun run check` plus dry-runs against known repos.

Future tests should use temp fixture repos and assert planned paths plus rendered content snapshots.
