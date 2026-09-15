# Markos Frontend

Next.js app with strict quality gates, MUI + Tailwind hybrid styling, and Impeccable design skill.

## Quality gates (mandatory)

All of the following must pass before every build:

```bash
npm run validate   # lint + typecheck + audit + deps
npm run build      # validate, then next build
```

| Check | Script | Requirement |
|-------|--------|-------------|
| Lint | `npm run lint` | 0 errors, 0 warnings (`--max-warnings 0`) |
| Types | `npm run typecheck` | No TypeScript errors |
| Security | `npm run audit:check` | 0 vulnerabilities |
| Dependencies | `npm run deps:check` | No semver drift (`current` must equal `wanted`) |

Use `npm run lint:fix` locally to auto-fix ESLint issues.

## Design (Impeccable)

When building or redesigning UI, invoke the **impeccable** skill. Run the context script once per session before design work.

Design context lives in `PRODUCT.md` and `DESIGN.md` at the project root.

## Conventions

- Keep data fetching out of synchronous `useEffect` setState paths (React hooks lint rules).
- Prefer server components for initial data when possible; use client components for interactivity.
- Shared UI primitives live in `src/components/ui/`.
- API calls to the backend use `/api/*` (proxied to `http://localhost:3008` in dev).

## Local development

```bash
npm run dev   # http://localhost:3007
```

Ensure `markos-backend` is running for `/api/health` to respond.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
