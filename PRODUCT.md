# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router), React 19, MUI 9, Tailwind CSS v4, TypeScript. Backend: NestJS 11 + PostgreSQL via separate `markos-backend` service.

## Users

Developers and product teams building on the Markos platform scaffold. Primary job: start new features on a production-grade foundation with strict quality gates.

## Product Purpose

Markos is a platform scaffold — not a finished product. It provides a wired frontend and backend with zero-tolerance lint, security, and dependency checks, layered backend architecture, and reusable frontend components. Success means teams can add features without fighting the boilerplate.

## Positioning

Strict quality gates enforced in the build script (lint, audit, deps) plus ESLint-enforced controller/service/repository separation — most scaffolds document these rules; Markos enforces them.

## Operating Context

- Frontend dev server: port 3007
- Backend API: port 3008
- PostgreSQL: port 5435 via Docker Compose
- API proxy: frontend `/api/*` rewrites to backend

## Capabilities and Constraints

- Health check endpoint proves end-to-end wiring
- Auth, feature modules, and CI/CD are out of scope for the initial scaffold
- Features to be added in subsequent sessions

## Brand Commitments

- Product name: **Markos**
- Voice: direct, technical, confident — no hype
- Primary brand color: indigo (`#4338CA` light / `#818CF8` dark)

## Evidence on Hand

- Landing page at `/` with live health status from `/api/health`
- No fabricated testimonials, pricing, or customer logos

## Product Principles

1. Quality gates are non-negotiable — fix code, never weaken rules
2. Thin pages, fat components — routes delegate to `*Content` components
3. Backend layers stay separated — HTTP, business logic, DB access
4. Reusable UI primitives live in `src/components/ui/`
5. Design serves the product — clarity over decoration on app surfaces

## Accessibility & Inclusion

- WCAG 2.1 AA contrast targets for body text
- Reduced motion respected via `prefers-reduced-motion`
- Semantic HTML and ARIA labels on interactive controls
