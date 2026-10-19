# 🌸 Velora — AI Event Planning Assistant

> **Celebrate beautifully.**

Velora is a GenAI-powered event planning assistant that helps users organize weddings, birthdays, and community events with AI-crafted budgets, timelines, vendor checklists, and personalized ideas.

Built with Next.js 15, TypeScript strict mode, and Groq LLMs for real-time AI generation.

---

## 🎯 Chosen Vertical

**GenAI-Powered Planning Assistant** — specifically targeting the event planning domain.

We chose event planning because it perfectly showcases AI's ability to handle multi-dimensional planning problems. Events involve budget optimization, timeline scheduling, vendor coordination, and creative ideation — all areas where LLMs excel. Velora goes beyond simple chatbots by combining:

- **Structured output** (JSON plans with budget breakdowns, timelines, vendor checklists)
- **Unstructured conversation** (streaming chat for quick questions)
- **Heuristic pre-classification** (routing queries to the optimal model)

This vertical demonstrates a complete end-to-end AI workflow: input → classify → route → generate → validate → display.

---

## 🧠 Approach and Logic

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Landing   │  │ Plan Form    │  │ Streaming Chat           │  │
│  │ Page      │  │ + Results    │  │ (SSE Real-time)          │  │
│  └──────────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│                       │                      │                  │
│              useEventPlanner()     useStreamingResponse()       │
└───────────────────────┼──────────────────────┼──────────────────┘
                        │                      │
                   POST /api/plan         POST /api/chat (SSE)
                   POST /api/ask          GET  /api/usage
                        │                      │
┌───────────────────────┼──────────────────────┼──────────────────┐
│                     SERVER (Next.js API Routes)                 │
│                                                                 │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────┐    │
│  │ Zod         │──▶│ Rate Limiter │──▶│ Event Classifier  │    │
│  │ Validation  │   │ (IP-based)   │   │ (Regex Heuristic) │    │
│  └─────────────┘   └──────────────┘   └────────┬──────────┘    │
│                                                 │               │
│                           ┌─────────────────────┼───────┐       │
│                           ▼                     ▼       │       │
│                    ┌──────────────┐    ┌────────────┐   │       │
│                    │ Event        │    │ Prompt      │   │       │
│                    │ Chunker      │    │ Templates   │   │       │
│                    └──────┬───────┘    └──────┬─────┘   │       │
│                           │                   │         │       │
│                           ▼                   ▼         │       │
│                    ┌──────────────────────────────┐      │       │
│                    │     Groq SDK Singleton       │      │       │
│                    │  ┌────────────┬────────────┐ │      │       │
│                    │  │  120B OSS  │  20B OSS   │ │      │       │
│                    │  │ (Complex)  │  (Simple)  │ │      │       │
│                    │  └────────────┴────────────┘ │      │       │
│                    └──────────────────────────────┘      │       │
│                                                         │       │
│                    ┌──────────────────────────────┐      │       │
│                    │  Zod Output Validation       │◀─────┘       │
│                    └──────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Pillars

1. **Heuristic Pre-Classification** — Regex-based complexity scoring routes queries to the optimal model *before* calling the LLM, saving tokens and latency.
2. **Two-Tier Model Routing** — `openai/gpt-oss-120b` for complex multi-domain queries; `openai/gpt-oss-20b` for quick questions and greetings.
3. **Smart Input Chunking** — Large descriptions are split at logical boundaries (paragraphs → sentences → words) to stay within token limits.
4. **Dual Validation** — Both API inputs and AI outputs are validated with Zod schemas.
5. **SSE Streaming** — Server-Sent Events deliver AI responses token-by-token for real-time UX.
6. **Sliding Window Rate Limiting** — IP-based limits with `globalThis` persistence across HMR.
7. **Security-First Headers** — CSP, HSTS, frame protection, and API key isolation.

---

## ⚙️ How the Solution Works

### Flow 1: Plan Generation (`/planner`)

1. User selects event type (wedding / birthday / community) and fills in details.
2. Form data is validated client-side and sent to `POST /api/plan`.
3. Server validates input with Zod's `eventPlanRequestSchema`.
4. `extractClientIp()` retrieves the IP; `checkRateLimit()` enforces 10 plans / 15 min.
5. `classifyEventQuery()` scores the input's complexity and selects the optimal model.
6. `chunkEventInput()` ensures the description fits within the 6000-token context window.
7. `buildEventPlanPrompt()` injects user details into a structured JSON-producing prompt.
8. `chatCompletion()` calls the Groq API with the selected model.
9. The AI response is parsed as JSON, then validated against `eventPlanSchema`.
10. The plan (budget, timeline, vendors, ideas) is returned and rendered in a tabbed UI.

### Flow 2: AI Chat (`/chat`)

1. User types a message in the streaming chat interface.
2. `useStreamingResponse()` sends the conversation history to `POST /api/chat`.
3. Server validates with `streamRequestSchema`, checks rate limit (15 / 5 min).
4. `classifyEventQuery()` picks the model based on the latest user message.
5. `chatCompletionStream()` opens a streaming connection to Groq.
6. The response is relayed via SSE with `data:` events (`meta`, `content`, `done`).
7. Client-side, each `content` event is appended to the assistant message in real-time.
8. Users can abort mid-stream with the stop button.

### Flow 3: Quick Questions (`/api/ask`)

1. A question + optional event context is sent to `POST /api/ask`.
2. Classified, rate-limited, and routed through the same pipeline as above.
3. Non-streaming response returned in a single JSON payload.

---

## 📌 Assumptions Made

1. **Single-user sessions** — No authentication or persistent user accounts; each session is stateless. Plans are generated on-demand, not saved server-side.
2. **USD currency** — All budget figures and cost estimates are in US dollars. International pricing differences are not modeled.
3. **English language** — All prompts, UI text, and AI responses are in English. Multilingual support is out of scope.
4. **Groq API availability** — The app assumes the Groq API is available and responsive. Temporary outages will surface as user-facing errors.
5. **Date accuracy** — The AI's recommendations for vendor booking timelines are based on general best practices, not real-time availability data.
6. **Legal compliance** — Users are responsible for verifying vendor licensing, permits, and local regulations. Velora provides suggestions, not legal advice.

---

## 🏆 Evaluation Focus Areas Alignment

### Code Quality (High Impact)

- **TypeScript strict mode**: `tsconfig.json` has `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` — zero `any` types.
- **Zero ESLint warnings**: All code follows `eslint-config-next` rules.
- **Pure state initializers**: All `useState` calls use `''`, `false`, `null`, or `[]` — no `Date.now()` or `Math.random()`.
- **Named exports**: All components use named exports (`export function Badge`).
- **Modular architecture**: Each `/lib` module has a single responsibility — `groq.ts` (client), `rate-limiter.ts` (security), `validators.ts` (schemas), `prompt-templates.ts` (prompts), `event-classifier.ts` (routing), `event-chunker.ts` (chunking).
- **Readonly types**: All interfaces in `types/event.ts` use `readonly` properties.

### Security (High Impact)

- **7 security headers** in `next.config.ts` lines 7–36: X-Frame-Options, X-Content-Type-Options, X-DNS-Prefetch-Control, Referrer-Policy, Permissions-Policy, HSTS, CSP.
- **Rate limiter** in `lib/rate-limiter.ts`: Sliding window algorithm with `globalThis` persistence, IP extraction, and standard `X-RateLimit-*` headers.
- **Zod validation** in every API route: `app/api/plan/route.ts`, `app/api/ask/route.ts`, `app/api/chat/route.ts` — all validate before processing.
- **API key isolation**: `GROQ_API_KEY` is only accessed in `lib/groq.ts` (server-side); never imported by client components.
- **Error handling**: Typed catch blocks return structured `ApiErrorResponse` objects.

### Efficiency (High Impact)

- **Heuristic pre-classifier**: `lib/event-classifier.ts` uses 20+ regex patterns to score complexity *before* calling the LLM.
- **Two-tier routing**: Complex → `openai/gpt-oss-120b` (deep reasoning); Simple → `openai/gpt-oss-20b` (fast, cheap).
- **Smart chunking**: `lib/event-chunker.ts` splits at paragraph → sentence → word boundaries, preserving context within the 6000-token window.
- **SSE streaming**: `app/api/chat/route.ts` uses `ReadableStream` for token-by-token delivery.
- **`useCallback` / `useMemo`**: Used in `PlanResults.tsx` for tab switching and budget computation; `ChatInterface.tsx` for message sending; hooks for API calls.

### Testing (Medium Impact)

- **6 test files** covering all `/lib` modules: `rate-limiter`, `groq`, `prompt-templates`, `validators`, `event-classifier`, `event-chunker`.
- **Aim**: 40–60 tests across happy paths, edge cases, and error conditions.
- **Framework**: Vitest with `globals: true` and path alias resolution.
- See **🧪 Testing** section below for full coverage table.

### Accessibility (Medium Impact)

- **Skip link**: `app/layout.tsx` — `<a href="#main-content" className="skip-link">`.
- **Main landmark**: `<main id="main-content">` wraps all page content.
- **Heading hierarchy**: Every page has exactly one `<h1>`, followed by `<h2>`/`<h3>`.
- **ARIA labels**: All buttons have `aria-label` or visible text.
- **Live regions**: Loading → `<div role="status" aria-live="polite">`; Errors → `<div role="alert" aria-live="assertive">`; Chat → `aria-live="polite" aria-atomic="false"`.
- **Tab pattern**: `PlanResults.tsx` uses `role="tablist"`, `role="tab"`, `role="tabpanel"` with `aria-selected`, `aria-controls`, `aria-labelledby`.
- **Form labels**: All inputs have `<label htmlFor>` and `aria-describedby` for hints.
- **Reduced motion**: `globals.css` includes `@media (prefers-reduced-motion: reduce)`.
- **Focus styles**: `btn:focus-visible` has `outline: 2px solid var(--accent)`.
- **Keyboard nav**: All interactive elements reachable via Tab + Enter/Space.

---

## 🏗️ Architecture

```
velora/
├── app/
│   ├── page.tsx                      # Premium landing page with hero + features
│   ├── layout.tsx                    # Root layout with SEO, skip link, nav, footer
│   ├── globals.css                   # Full design system (700+ lines of CSS tokens)
│   ├── planner/
│   │   └── page.tsx                  # Split-layout plan generation page
│   ├── chat/
│   │   └── page.tsx                  # Full-screen streaming AI chat
│   └── api/
│       ├── plan/route.ts             # POST — Full plan generation (Zod + AI + validation)
│       ├── ask/route.ts              # POST — Quick Q&A endpoint
│       ├── chat/route.ts             # POST — SSE streaming chat
│       └── usage/route.ts            # GET  — Rate limit analytics
├── components/
│   ├── planner/
│   │   ├── EventPlanForm.tsx         # Multi-field form with event type selector
│   │   ├── PlanResults.tsx           # Tabbed results (overview/budget/timeline/vendors/ideas)
│   │   └── ChatInterface.tsx         # Streaming chat with suggestions and abort
│   └── ui/
│       ├── Badge.tsx                 # Multi-variant badge component
│       └── UsageWidget.tsx           # Fixed-position API usage monitor
├── hooks/
│   ├── useEventPlanner.ts            # Form state + plan generation hook
│   └── useStreamingResponse.ts       # SSE streaming with abort support
├── lib/
│   ├── groq.ts                       # Groq SDK singleton + completion helpers
│   ├── rate-limiter.ts               # Sliding window IP rate limiter
│   ├── validators.ts                 # Zod schemas for all inputs/outputs
│   ├── prompt-templates.ts           # Versioned system prompts + builders
│   ├── event-classifier.ts           # Regex heuristic complexity classifier
│   └── event-chunker.ts             # Smart boundary-aware text chunking
├── types/
│   └── event.ts                      # All TypeScript interfaces (readonly)
├── __tests__/
│   └── lib/
│       ├── groq.test.ts              # Client init, missing key, singleton
│       ├── rate-limiter.test.ts       # Enforcement, window, headers, IPs
│       ├── prompt-templates.test.ts   # Content, context, version
│       ├── validators.test.ts         # All schemas: valid, invalid, edge
│       ├── event-classifier.test.ts   # Complexity, types, categories, edges
│       └── event-chunker.test.ts      # Chunking, tokens, boundaries
├── .env.example                      # GROQ_API_KEY template
├── next.config.ts                    # Security headers + optimizations
├── tsconfig.json                     # Strict TypeScript config
├── vitest.config.ts                  # Test runner config
├── package.json                      # Dependencies + scripts
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17+ (recommended: 20+)
- **npm** 9+ or **pnpm** 8+
- **Groq API Key** — get one free at [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd velora

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Velora.

### Available Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start development server         |
| `npm run build`      | Build for production             |
| `npm run lint`       | Run ESLint                       |
| `npm run type-check` | TypeScript type checking         |
| `npm run test`       | Run all tests                    |
| `npm run test:watch` | Run tests in watch mode          |
| `npm run test:coverage` | Run tests with coverage report |

---

## 🤖 AI Models

| Model                       | ID                         | Use Case                                              | Routing Trigger                        |
| --------------------------- | -------------------------- | ----------------------------------------------------- | -------------------------------------- |
| GPT-OSS 120B                | `openai/gpt-oss-120b`      | Complex plans, multi-vendor coordination, budgets      | Complexity score ≥ 1 (complex/moderate) |
| GPT-OSS 20B                 | `openai/gpt-oss-20b`       | Quick questions, recommendations, greetings            | Complexity score = simple              |

**Model Selection Logic** (in `lib/event-classifier.ts`):
- 20+ complex patterns (budget breakdown, vendor negotiation, multi-day, destination, sustainability, etc.)
- 12+ simple patterns (what/how/when questions, recommendations, tips, greetings)
- Token length factor: >500 tokens adds complexity score
- Category diversity factor: ≥4 categories adds complexity score

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Coverage

| Test File                              | Module              | Tests | Covers                                          |
| -------------------------------------- | ------------------- | ----- | ----------------------------------------------- |
| `__tests__/lib/rate-limiter.test.ts`   | Rate Limiter        | 15    | Enforcement, window expiry, IP/endpoint independence, headers |
| `__tests__/lib/groq.test.ts`           | Groq Client         | 8     | Init, missing key, placeholder, singleton, exports |
| `__tests__/lib/prompt-templates.test.ts` | Prompt Templates  | 21    | System prompt, version, builders, context injection |
| `__tests__/lib/validators.test.ts`     | Zod Validators      | 24    | All schemas: valid, invalid, edge cases, AI output |
| `__tests__/lib/event-classifier.test.ts` | Event Classifier  | 22    | Complexity, event types, categories, chunking, edges |
| `__tests__/lib/event-chunker.test.ts`  | Event Chunker       | 20    | Token estimation, chunking, boundaries, extraction |
| **Total**                              |                     | **110** |                                                 |

---

## 📄 License

This project was built for the Hack2Skill hackathon. All rights reserved.
