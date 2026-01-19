# Project Rules — YouTube Script Kit (VibeCoding)

## 1. Goal
Build a single-page MVP that generates:
- 15 video titles labeled: `SEO | click | balanced`
- 10 hook openings (first 5–15 seconds)
- an outline with timestamps fitting `2/5/10/20` minutes
- an intro + CTA tailored to goal (`views/subs/sales`)
- output language selectable: `ru` (default) or `en`

## 2. Fixed Tech Stack
- Next.js 14+ (App Router)
- TypeScript (`strict: true`)
- TailwindCSS
- API route handler: `POST /api/generate`
- Validation: `zod`
- LLM: OpenAI-compatible API via **server** environment variables
- Storage (MVP): `localStorage` only

## 3. Non-goals (MVP)
- No authentication
- No payments
- No database
- No server-side history
- No background jobs
- No built-in image generation

## 4. Code Standards

### 4.1 TypeScript
- `strict: true`
- No `any` (use `unknown` + narrowing)
- Prefer `type` over `interface` unless extension is required
- Keep modules small; single responsibility per file
- No `console.log` in production paths (optional: gated debug)

### 4.2 Formatting & Lint
- ESLint + Prettier enabled
- Max line length: 100 (TS/TSX)
- No unused vars/imports
- Prefer early returns and clear error handling

### 4.3 If Python is ever used
- PEP8
- Max line length: 79 chars INCLUDING indentation
- Use `ruff` + `black` configured to 79-char lines
- Optional: `mypy`

## 5. API Contract (must not break)

### 5.1 Request (POST /api/generate)
```json
{
  "niche": "string",
  "topic": "string",
  "durationMinutes": 2 | 5 | 10 | 20,
  "style": "calm" | "energetic",
  "goal": "views" | "subs" | "sales",
  "outputLanguage": "ru" | "en"
}
5.2 Success Response (strict JSON)
json
Копировать код
{
  "titles": [
    { "label": "SEO" | "click" | "balanced", "text": "string" }
  ],
  "hooks": [
    { "text": "string", "seconds": 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 }
  ],
  "outline": [
    { "t": "0:00", "segment": "string", "notes": "string" }
  ],
  "intro": { "text": "string" },
  "cta": { "text": "string" }
}
5.3 Error Response (JSON only)
json
Копировать код
{
  "error": {
    "code": "BAD_REQUEST" | "LLM_ERROR" | "PARSE_ERROR" | "RATE_LIMIT",
    "message": "string"
  }
}
6. Reliability Rules (critical)
UI must never crash due to model drift.

LLM output must be parsed as JSON and validated with zod.

If output is invalid: return PARSE_ERROR (do not attempt to render partial content).

7. Content Quality Rules
No generic advice or filler. Output must be copy-paste ready.

Titles must be diverse (angles: pain/benefit/mistake/comparison/challenge).

Hooks must be short (1–2 sentences), punchy, no slow intros.

Outline must fit duration:

total planned time must not exceed durationMinutes

first 20% of the video must deliver value fast

Intro must match style and avoid clichés.

CTA must match goal:

views: “watch till the end” with a concrete promise

subs: “subscribe” with a specific benefit

sales: soft offer + clear next step

8. UI Rules
Single page, responsive

Tabs: Titles / Hooks / Outline / Intro+CTA

Copy button for each tab/section

“Use example” fills the form

localStorage history:

keep last 20 generations

allow re-open and delete

9. Security & Privacy
Never log user inputs server-side (MVP)

Do not store prompts/results server-side

API key only via server env vars, never exposed to the client

10. Commit Discipline (optional but recommended)
Small commits by feature

Prefixes: feat:, fix:, chore:

11. MVP Done Criteria
Generate in <10 seconds in normal cases

Strict JSON output + zod validation

localStorage history works

README includes setup, env vars, and run commands