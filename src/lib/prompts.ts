import type { GenerateRequest } from "./schemas";

export function buildPrompt(req: GenerateRequest): string {
  const langInstructions =
    req.outputLanguage === "ru"
      ? "Respond ENTIRELY in Russian. All titles, hooks, outline segments, intro, and CTA must be in Russian."
      : "Respond ENTIRELY in English. All titles, hooks, outline segments, intro, and CTA must be in English.";

  const styleInstructions =
    req.style === "calm"
      ? "Use a calm, thoughtful, professional tone. Avoid hype and exclamation marks."
      : "Use an energetic, dynamic, enthusiastic tone. Be punchy and exciting.";

  const goalInstructions = {
    views:
      "CTA should encourage watching till the end with a concrete promise of what they'll learn.",
    subs: "CTA should encourage subscribing with a specific benefit they'll get from the channel.",
    sales:
      "CTA should be a soft offer with a clear next step (link in description, etc.).",
  }[req.goal];

  return `You are a YouTube script expert. Generate content for a video.

INPUTS:
- Niche: ${req.niche}
- Topic: ${req.topic}
- Duration: ${req.durationMinutes} minutes
- Style: ${req.style}
- Goal: ${req.goal}
- Language: ${req.outputLanguage}

${langInstructions}

${styleInstructions}

REQUIREMENTS:

1. TITLES (exactly 15):
- 5 with label "SEO" - optimized for search, include keywords
- 5 with label "click" - curiosity-driven, emotional triggers
- 5 with label "balanced" - mix of SEO and clickability
- Each title must be unique and use different angles: pain/benefit/mistake/comparison/challenge
- No generic titles. Be specific to the topic.

2. HOOKS (exactly 10):
- First 5-15 seconds of the video
- Each hook has "text" and "seconds" (integer 5-15)
- Must be punchy, 1-2 sentences max
- No slow intros, no "hey guys", no greetings
- Start with a bold statement, question, or surprising fact

3. OUTLINE:
- Must fit exactly ${req.durationMinutes} minutes
- Use timestamp format "m:ss" (e.g., "0:00", "1:30", "10:00")
- First 20% of video must deliver value fast
- Each segment has "t" (timestamp), "segment" (section name), "notes" (what to cover)
- Be specific, no filler segments

4. INTRO:
- ${styleInstructions}
- Avoid clichés like "welcome back to my channel"
- Get straight to the value proposition

5. CTA:
- ${goalInstructions}
- Must feel natural, not pushy

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "titles": [
    { "label": "SEO", "text": "..." },
    { "label": "click", "text": "..." },
    { "label": "balanced", "text": "..." }
  ],
  "hooks": [
    { "text": "...", "seconds": 8 }
  ],
  "outline": [
    { "t": "0:00", "segment": "...", "notes": "..." }
  ],
  "intro": { "text": "..." },
  "cta": { "text": "..." }
}

CRITICAL: Output ONLY the JSON object. No text before or after. No markdown code blocks.`;
}
