# Workspace

## Overview

pnpm workspace monorepo using TypeScript. KonbiniCompare — a Japan-first product comparison web app for convenience store products.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: None (stateless, in-memory fixtures)
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle for API server)
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui
- **AI**: OpenAI via Replit AI Integration (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`)

## Project: KonbiniCompare

A Japan-first product comparison tool. Users pick a category, select 2–5 products, set preference sliders, and get a deterministically ranked result with per-dimension score breakdowns and bilingual (Japanese/English) LLM-generated explanations.

### Architecture

- **No auth, no database** — fully stateless with seeded in-memory fixtures
- **Deterministic scoring engine** — ranking is always computed from product data + user preferences, never by the LLM
- **LLM role** — only generates natural-language summaries AFTER the ranking is decided
- **Bilingual** — all categories, products, and explanations have Japanese + English text

### Key Files

| File | Purpose |
|------|---------|
| `lib/api-spec/openapi.yaml` | OpenAPI spec (source of truth) |
| `lib/api-client-react/` | Orval-generated React Query hooks |
| `lib/api-zod/` | Orval-generated Zod schemas |
| `artifacts/api-server/src/services/fixtures.ts` | 35 seeded products across 5 categories |
| `artifacts/api-server/src/services/categories.ts` | 5 categories + 6 demo scenarios |
| `artifacts/api-server/src/ranking/engine.ts` | Deterministic weighted scoring engine |
| `artifacts/api-server/src/services/explanation.ts` | OpenAI bilingual explanation (with fallback) |
| `artifacts/api-server/src/routes/konbini.ts` | API route handlers |
| `artifacts/konbini-compare/src/pages/` | Frontend pages (home, compare, result, demo, how-it-works) |

### Routes

**Frontend (`/`)**
- `/` — Home page with category grid
- `/compare` — 3-step wizard (category → products → preferences)
- `/result` — Ranked results with score breakdowns + bilingual summary
- `/demo` — 6 pre-built demo scenarios
- `/how-it-works` — Explanation of scoring algorithm

**API (`/api`)**
- `GET /api/healthz` — Health check
- `GET /api/categories` — 5 product categories with emoji icons
- `GET /api/demo-products?category=<id>` — Products filtered by category
- `GET /api/demo-scenarios` — 6 pre-built comparison scenarios
- `POST /api/compare-products` — Compare products and get ranked results with AI explanation

### Categories & Products

- **Drinks** (☕) — 7 products: canned coffee, green tea, sports drinks, energy drinks
- **Snacks** (🍘) — 7 products: onigiri, protein bars, nuts, chips
- **Supplements** (💊) — 7 products: vitamin C, collagen, iron, B12, zinc, omega-3, magnesium
- **Skincare** (✨) — 7 products: face wash, toner, sunscreen, sheet masks
- **Household** (🏠) — 7 products: detergent, cleaning spray, hand soap, dish soap

### Scoring Dimensions

Price, Value for Money, Caffeine, Calories, Sugar, Protein, Additives, Allergen Safety, Skin Safety, Convenience — each weighted by user preference sliders.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec (then manually fix `lib/api-zod/src/index.ts` to only have `export * from "./generated/api";`)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Codegen Notes

Run orval as: `cd lib/api-spec && npx orval --config ./orval.config.ts`
After codegen, manually fix `lib/api-zod/src/index.ts` to only contain: `export * from "./generated/api";`

## Environment Variables

- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy base URL (Replit AI Integration)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI proxy API key (Replit AI Integration)
- `SESSION_SECRET` — Session secret (unused currently, set for future auth)
- `PORT` — Service port (set by Replit workflow per artifact)
