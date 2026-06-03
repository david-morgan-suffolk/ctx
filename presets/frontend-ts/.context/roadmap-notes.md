# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:
- `YYYY-MM-DD` — Initial Vite + React + TS scaffold.
- `YYYY-MM-DD` — Auth surface wired (TODO: provider).
- `YYYY-MM-DD` — Design tokens + dark mode landed.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- Strict TypeScript; no implicit `any`. *Why: catches API contract drift at compile time.*
- Browser code never imports server code. Shared types only via `src/shared/`. *Why: keeps bundles free of server-only deps and secrets.*
- Every async surface renders idle/loading/success/error explicitly. *Why: prevents silent failures and ambiguous UX.*
- TODO: state management choice and reason.
- TODO: routing choice and reason.
- TODO: server-data caching choice (TanStack Query / SWR / hand-rolled) and reason.
- TODO: test-runner choice and reason.
- TODO: deployment target (static host / CDN / containerized server) and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:
- TODO: no e2e coverage yet — revisit when first regression surfaces.
- TODO: ad-hoc error toasts — consolidate when third surface needs one.

## Staged Work

TODO. Next planned chunks, ordered. Keep this short — it is a pointer, not a backlog.
1. TODO
2. TODO
3. TODO

## Refresh Checklist

When this file is updated, also confirm:
- Commands in `.context/engineering-guide.md` still match `package.json`.
- Ownership Map in `.context/project-context.md` still matches `src/` layout.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
