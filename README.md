# ClipSprint

AI-powered tools for YouTube creators: generate scripts, fix retention, find clips, and remove silence.

## Features

- Generate 15 video titles (SEO / click / balanced)
- Generate 10 hook openings (5–15 seconds)
- Generate outline with timestamps for 2/5/10/20 minute videos
- Generate intro + CTA tailored to goal (views/subs/sales)
- Output language: Russian (default) or English
- Local history storage (last 20 generations)

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript (strict mode)
- TailwindCSS
- Zod validation
- OpenAI-compatible API

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your API key:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_API_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4o
   ```

## Run

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoint

`POST /api/generate`

### Request Body
```json
{
  "niche": "string",
  "topic": "string",
  "durationMinutes": 2 | 5 | 10 | 20,
  "style": "calm" | "energetic",
  "goal": "views" | "subs" | "sales",
  "outputLanguage": "ru" | "en"
}
```

### Success Response
```json
{
  "titles": [{ "label": "SEO" | "click" | "balanced", "text": "string" }],
  "hooks": [{ "text": "string", "seconds": 5-15 }],
  "outline": [{ "t": "0:00", "segment": "string", "notes": "string" }],
  "intro": { "text": "string" },
  "cta": { "text": "string" }
}
```

### Error Response
```json
{
  "error": {
    "code": "BAD_REQUEST" | "LLM_ERROR" | "PARSE_ERROR" | "RATE_LIMIT",
    "message": "string"
  }
}
```

## License

MIT
