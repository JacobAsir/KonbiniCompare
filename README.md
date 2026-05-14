# 🍱 KonbiniCompare | コンビニ比較

**Which one should I grab? どっちを選ぶ？**

KonbiniCompare helps you make quick, confident decisions in Japanese convenience stores. Search or scan any product, compare two items, get an instant personalized verdict with honest trade-offs.

---

## 🌟 How It Works

1. **Search or Scan** — Find products by name, brand, Japanese text, or scan the barcode with your phone
2. **Compare** — Pick 2 products and tap "Compare Now"
3. **Decide** — Clear winner with a one-sentence explanation and trade-offs

Your preferences are set once in a profile (Budget / Health / Clean Ingredients / Balanced) — no sliders to configure every time.

---

## ✨ Key Features

- **🔍 Search-first UX** — Find products by name, brand, or Japanese text
- **📷 Barcode Scanner** — Point your phone camera at any barcode for instant lookup
- **🌍 Real product data** — Powered by [Open Food Facts](https://world.openfoodfacts.org) with thousands of real products (nutrition, allergens, ingredients)
- **⚡ Instant results** — Pick 2 products → get a winner in seconds
- **👤 One-time profile** — Set your priority once (Budget / Health / Clean / Balanced); every comparison is personalized
- **🎯 Deterministic scoring** — Rankings use a transparent weighted algorithm, not AI guesswork
- **🇯🇵 Bilingual** — Explanations in both English and Japanese (LLM-powered)
- **⚠️ Safety flags** — Allergen warnings and ingredient cautions
- **📊 Expandable details** — Score breakdowns and side-by-side tables when you want them

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Lucide Icons |
| **Backend** | Node.js (Express 5), TypeScript 5.9 |
| **Data** | Open Food Facts API (real products) + curated demo catalog |
| **Barcode** | Native BarcodeDetector API (with manual entry fallback) |
| **AI** | Groq (Llama 3.3 70B) for bilingual explanations |
| **Styling** | shadcn/ui components |
| **Package Manager** | pnpm Workspaces (Monorepo) |

---

## 📂 Project Structure

```text
.
├── artifacts/
│   ├── api-server/         # Express backend (scoring, search, OFF integration)
│   └── konbini-compare/    # React frontend (search → compare → result)
├── lib/
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-spec/           # OpenAPI 3.0 specification
│   └── integrations-*/     # Groq AI integration
└── package.json            # Workspace configuration
```

---

## 🏗️ Architecture

### System Overview

```mermaid
flowchart TB
    subgraph Client["🖥️ Client (Browser / Mobile)"]
        UI[React SPA<br/>Vite + Tailwind]
        Cam[📷 BarcodeDetector API<br/>native camera]
        LS[(localStorage<br/>profile + allergens)]
        UI -.reads/writes.-> LS
        UI -.uses.-> Cam
    end

    subgraph Server["⚙️ API Server (Express + TypeScript)"]
        direction TB
        Routes[REST Routes<br/>/search /barcode /quick-compare]
        Engine["🎯 Scoring Engine<br/>(deterministic)<br/>min-max normalize →<br/>weight → aggregate → rank"]
        Explain[📝 Explanation Service<br/>bilingual summary builder]
        Cache[(In-memory<br/>product cache)]
        Routes --> Engine
        Routes --> Explain
        Routes -.-> Cache
    end

    subgraph External["🌍 External Services"]
        OFF[(Open Food Facts<br/>world.openfoodfacts.org<br/>ODbL license)]
        Groq[Groq LLM<br/>Llama 3.3 70B]
    end

    subgraph Data["📦 Local Data"]
        Catalog[35 curated<br/>Japan products<br/>with pricing]
    end

    UI -->|HTTP /api/*| Routes
    Routes -->|real product lookup| OFF
    Routes -->|fuzzy match| Catalog
    Explain -->|bilingual summary prompt| Groq
    Explain -.fallback if no key.-> Routes

    style Engine fill:#e0f2fe,stroke:#0284c7
    style OFF fill:#fef3c7,stroke:#d97706
    style Groq fill:#fae8ff,stroke:#a21caf
    style Client fill:#f0fdf4,stroke:#16a34a
```

### Request Flow: "Which one should I grab?"

```mermaid
sequenceDiagram
    actor User as 🛒 User in Konbini
    participant UI as React SPA
    participant API as Express API
    participant OpenFF as Open Food Facts
    participant Eng as Scoring Engine
    participant LLM as Groq LLM

    User->>UI: "Scan barcode or search"
    UI->>API: "GET /api/search?q=... or /api/barcode/:code"
    API->>OpenFF: "Fetch real product data"
    OpenFF-->>API: "nutrition, allergens, ingredients"
    API-->>UI: "merged local + OpenFF results"
    User->>UI: "Select 2–5 products, tap 'Compare'"
    UI->>API: "POST /api/quick-compare {productIds, profile, allergens}"
    API->>Eng: "score(products, preferences)"
    Note over Eng: 1. Normalize each dimension [0,1]<br/>2. Weight by profile + allergens<br/>3. Aggregate → rank<br/>4. Detect missing data penalty
    Eng-->>API: "ranked results + breakdown"
    API->>LLM: "Explain why this ranking, bilingual"
    LLM-->>API: "EN + JA summary"
    API-->>UI: "winner + reasoning + trade-offs"
    UI-->>User: "🏆 Best Match card + score"
```

### Scoring Engine (Core Logic)

```mermaid
flowchart LR
    A[Raw product<br/>values] --> B[Min-max<br/>normalize]
    B --> C["Apply preference<br/>weights<br/>(from profile)"]
    C --> D[Weighted<br/>average]
    D --> E[Missing data<br/>penalty -4% per field]
    E --> F[Sort by score<br/>tiebreak by name]
    F --> G[Rank +<br/>strengths/tradeoffs/cautions]

    P[User profile<br/>Budget / Health /<br/>Clean / Balanced] -->|presets| C
    AL[Allergen flags] -->|hard constraints| C

    style B fill:#dbeafe
    style D fill:#dbeafe
    style G fill:#dcfce7
```

**Key principle:** The scoring engine is fully deterministic. The LLM only writes the natural-language summary _after_ ranking — it cannot change the order or invent product facts.

### Monorepo Structure

```text
KonbiniCompare/
├── artifacts/
│   ├── api-server/              # Express backend
│   │   └── src/
│   │       ├── routes/          # /search, /barcode, /quick-compare
│   │       ├── ranking/         # engine.ts (scoring)
│   │       └── services/        # products, openfoodfacts, explanation
│   └── konbini-compare/         # React frontend
│       └── src/
│           ├── pages/           # home, profile, result, how-it-works
│           ├── components/      # BarcodeScanner, Layout, ui/*
│           └── lib/             # CompareContext (localStorage state)
├── lib/
│   ├── api-spec/                # OpenAPI 3.1 (source of truth)
│   ├── api-client-react/        # Orval-generated hooks
│   ├── api-zod/                 # Zod schemas
│   └── integrations-groq-server/# Groq SDK wrapper
├── scripts/                     # smoke-test.mjs, test-llm.mjs
└── package.json                 # pnpm workspaces config
```

### Design Principles

| Principle | What it means |
|-----------|---------------|
| **AI explains, engine decides** | LLM never alters ranking; only produces bilingual prose |
| **Missing data is honest** | Unknown fields excluded from scoring, flagged to user, small penalty applied |
| **Profile over sliders** | 1 profile choice > 9 sliders per comparison |
| **Graceful degradation** | Works without `GROQ_API_KEY` (deterministic fallback) and without OFF (local catalog) |
| **Stateless server** | All user state lives in localStorage; no DB required |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 24+
- pnpm 9+

### Installation
```bash
pnpm install
```

### Running the App
```bash
pnpm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api`

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q=` | Search local + Open Food Facts (prioritizes Japan) |
| GET | `/api/barcode/:code` | Look up a product by barcode (EAN/UPC) |
| GET | `/api/products` | All local demo products (optional `?category=`) |
| GET | `/api/categories` | Product categories |
| POST | `/api/quick-compare` | Compare with profile-based preferences |
| POST | `/api/compare-products` | Compare with explicit preference weights |

---

## 👤 Profile Presets

Instead of 9 sliders, users pick one profile:

| Profile | Focus |
|---------|-------|
| **Budget** | Price and value-per-yen weighted highest |
| **Health** | Nutrition, protein, low sugar prioritized |
| **Clean** | Minimal additives, gentle ingredients |
| **Balanced** | Equal weight across all dimensions |

Allergen concerns are saved separately and always applied on top of the profile.

---

## 🌍 Data Sources

- **Open Food Facts** — real-world product database (ODbL license). Nutrition, allergens, ingredients, brand, and barcodes.
- **Local demo catalog** — 35 curated Japan-specific products with pricing that OFF often lacks.

Local results appear first for Japan-specific products; OFF provides the long tail.

---

## ⚙️ Environment Variables

- `GROQ_API_KEY`: Your Groq API key (optional — falls back to deterministic explanations)
- `PORT`: API server port (default 3000)

---

## 📜 License & Attribution

Product data is provided by [Open Food Facts](https://world.openfoodfacts.org) under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

---

*Built for the Japanese convenience store connoisseur.*
