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

## Safety

- Do not read `.env`, `.secrets`, local params, copied certs, bearer headers, database URLs, DSNs, AWS secrets, or local credential values.
- Metadata reads are allowed for `package.json`, `tsconfig*.json`, known config filenames, and workspace package manifests.
- Dry-run must remain default.
- Writes must skip existing files unless `--force` is explicit.

## Testing

Current validation is smoke-level only. Use `bun run check` plus dry-runs against known repos.

Future tests should use temp fixture repos and assert planned paths plus rendered content snapshots.
