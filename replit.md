# VitaSense AI

An AI-powered educational health guidance platform that helps users understand their symptoms, provides urgency-level assessments, and suggests nearby healthcare facilities — all with clear medical disclaimers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/vitasense run dev` — run the frontend (port 21332)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Recharts, wouter, shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: OpenAI via Replit AI Integrations (gpt-5-mini for analysis & chatbot)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/analyses.ts` — saved analyses table
- `lib/db/src/schema/conversations.ts`, `messages.ts` — AI chatbot tables
- `artifacts/vitasense/src/pages/` — all frontend pages
- `artifacts/vitasense/src/lib/analysis-context.tsx` — React context for latest analysis result
- `artifacts/api-server/src/routes/symptoms.ts` — AI analysis + suggestions
- `artifacts/api-server/src/routes/analyses.ts` — CRUD + dashboard stats
- `artifacts/api-server/src/routes/openai/index.ts` — chatbot SSE streaming

## Architecture decisions

- AI symptom analysis uses GPT-5-mini with `response_format: json_object` for structured, reliable output
- Analyses are stored as flat rows with JSON-stringified conditions/advice arrays (avoids complex joins)
- Chatbot uses SSE streaming via raw fetch (not generated hooks — Orval can't type SSE)
- Dark mode implemented via next-themes with `localStorage` persistence
- All AI output uses educational language ("may be associated with") to avoid diagnostic claims

## Product

- **Landing page** — hero, features, how-it-works, testimonials, FAQ, medical disclaimer
- **Symptom Analyzer** — searchable multi-select tag input, duration/age/severity selectors, step-by-step form
- **Results page** — urgency badge, expandable conditions with educational content, lifestyle advice, save button, emergency warning
- **Dashboard** — stats cards, urgency breakdown pie chart (Recharts), recent analyses
- **History** — full analysis history with delete and detail view
- **AI Chatbot** — real-time streaming health Q&A with conversation management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After OpenAPI spec changes, always run `pnpm --filter @workspace/api-spec run codegen` before touching frontend code
- Import types from `@workspace/api-client-react` (barrel), never from deep paths like `.../src/generated/api.schemas`
- SSE chatbot endpoint cannot use generated hooks — use `fetch` + `ReadableStream` manually

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
