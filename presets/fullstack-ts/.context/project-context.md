# Project Context

Durable architecture and ownership. Update when the shape of the app changes, not on every commit.

## What This Repo Is

TODO: one-paragraph description. What product this app delivers, who uses it, what backend services it talks to beyond itself.

Default assumption baked into this preset: a single-repo TypeScript fullstack app — React/Vite client, Node/Hono server, both deployed together. Cross-boundary contracts live in `src/shared/`. The client never touches credentials or external SDKs; the server is the trusted boundary.

## Architecture (Data Flow)

```
browser
  → React component
  → API client (typed from src/shared/)
  → Hono route in src/server/ (Zod-validated against src/shared/)
  → service module
  → Drizzle / provider SDK
  → typed response (encoded against src/shared/ schema)
  → React render
```

Source of truth for UI state: client. Source of truth for domain data: server (Postgres or whatever persistence is wired). Shared schemas in `src/shared/` are the contract between the two — both sides must agree.

## Ownership Map

| Path | Owns |
|---|---|
| `src/client/` | All browser code: components, hooks/stores, API client, routing, styling. |
| `src/client/api/` | Typed HTTP client. Imports request/response shapes from `src/shared/`. |
| `src/server/` | All Node-only code: routes, services, DB, env parsing, observability. |
| `src/server/routes/` | Hono route handlers. Validate via `src/shared/` schemas; delegate to services. |
| `src/server/services/` | Business logic. Only layer that calls Drizzle / provider SDKs. |
| `src/server/db/` | Drizzle schema, migrations, connection. |
| `src/shared/` | Zod schemas + inferred TS types. Pure — no runtime imports of client- or server-only modules. |
| `vite.config.ts` | Client build, dev server, `/api` → server proxy. |
| `tsconfig.*.json` | Per-side TS config inheriting `tsconfig.base.json`. |
| `.context/` | Agent-readable durable context. |
| `README.md` | Human-facing setup, env vars, deployment. |

## Current Product State

TODO: list shipped surfaces and known boundaries. Examples:
- TODO: routes/screens implemented (client side).
- TODO: API endpoints exposed (server side).
- TODO: authenticated vs public surfaces.

If a feature is mid-flight, prefer `.context/current-focus.md` for the operational details.

## External Integrations

TODO. Document each external system the server talks to:
- Postgres / other persistence — connection from env, schema migration story.
- TODO: auth provider — where session lives, how the client knows it is logged in.
- TODO: object storage — what is stored, how URLs are signed.
- TODO: third-party APIs — credential scope, rate limits.

The client integrates only with this server's API. If the client ever needs to talk to a third party directly (analytics, embeds), document it explicitly here and confirm no secrets reach the bundle.

## Deferred Work

TODO. Things deliberately not built yet, with a one-line reason. Examples:
- TODO: split client/server into separate packages — single-repo is sufficient for now.
- TODO: SSR — SPA is sufficient for v1.
- TODO: realtime — polling covers the current surfaces.

## Non-Goals

- No client imports from `src/server/`.
- No backend secrets in the client bundle.
- No business logic in route handlers or React components — push to services / hooks respectively.
- No direct DB access from the client.
- No untyped `fetch` calls. Always go through the typed API client.
- No untyped routes. Always validate with a schema from `src/shared/`.
