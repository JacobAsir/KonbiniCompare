# 🏗️ Project Structure | プロジェクト構成

This document provides a detailed breakdown of the KonbiniCompare codebase, explaining the purpose of each directory and key file.

## 📂 Root Directory

| File / Folder | Purpose |
|---------------|---------|
| `artifacts/` | Primary application entry points (Frontend and Backend). |
| `lib/` | Shared libraries, specifications, and data schemas. |
| `scripts/` | Maintenance and build utility scripts. |
| `pnpm-workspace.yaml` | Defines the monorepo structure and shared dependencies (catalog). |
| `package.json` | Root configuration and workspace-wide scripts. |
| `tsconfig.base.json` | Base TypeScript configuration inherited by all packages. |

---

## 🖥️ Applications (`artifacts/`)

### `artifacts/konbini-compare/` (Frontend)
The React-based web application.
- **`src/pages/`**:
  - `home.tsx`: Landing page with category selection.
  - `compare.tsx`: The 3-step wizard (Select Products → Set Preferences → Review).
  - `result.tsx`: Displays ranked results, score charts, and AI summaries.
  - `demo.tsx`: Showcases pre-defined comparison scenarios.
  - `how-it-works.tsx`: Educational content explaining the scoring logic.
- **`src/components/`**: UI components (shadcn/ui) and custom comparison widgets.
- **`src/hooks/`**: Custom React hooks for state management and API interaction.
- **`vite.config.ts`**: Frontend build configuration.

### `artifacts/api-server/` (Backend)
The Node.js Express server.
- **`src/ranking/engine.ts`**: **The Core.** Contains the weighted normalization logic that ranks products deterministically.
- **`src/services/fixtures.ts`**: The "Database" - contains 35+ meticulously detailed Japanese products across 5 categories.
- **`src/services/explanation.ts`**: Orchestrates the LLM to generate bilingual insights based on the ranking results.
- **`src/routes/konbini.ts`**: API endpoints for fetching categories, products, and running comparisons.

---

## 📚 Shared Libraries (`lib/`)

| Library | Purpose |
|---------|---------|
| `lib/api-spec/` | Contains `openapi.yaml`, the source of truth for the entire API. |
| `lib/api-client-react/` | Auto-generated React Query hooks (via Orval) synchronized with the API spec. |
| `lib/api-zod/` | Auto-generated Zod schemas for request/response validation. |
| `lib/db/` | Drizzle ORM setup (currently configured for potential future expansion). |
| `lib/integrations-openai-*` | Clean abstractions for interacting with OpenAI models. |
| `lib/integrations-groq-server` | High-performance text analysis using Groq's Llama models. |
| `lib/integrations-google-ai-server` | Google Gemini integration (legacy/optional). |

---

## 🧠 The Deterministic Engine

The engine works by:
1. **Normalizing**: Scaling raw values (like price or calories) between 0 and 1 across the selected products.
2. **Weighting**: Multiplying normalized scores by user preference weights (from the sliders).
3. **Penalizing**: Applying small penalties for missing product data to ensure reliability.
4. **Ranking**: Sorting by the final weighted average.

The LLM is only called **after** this process is complete to provide a human-readable explanation of why the winner was chosen.

---

## 🛠️ Key Scripts

- `pnpm run build`: Builds all libraries and applications.
- `pnpm run typecheck`: Runs TypeScript compiler across the entire workspace.
- `pnpm --filter @workspace/api-spec run codegen`: Re-generates Zod schemas and React hooks if the OpenAPI spec changes.
