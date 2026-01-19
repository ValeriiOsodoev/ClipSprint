import type { AnalyzeRequest } from "./retention-schemas";

export function buildAnalyzePrompt(req: AnalyzeRequest): string {
  const langInstructions =
    req.language === "ru"
      ? "All output text (why, rewrite, line, notes, visual, onScreenText, tightScript) must be in Russian."
      : "All output text (why, rewrite, line, notes, visual, onScreenText, tightScript) must be in English.";

  const styleInstructions =
    req.style === "calm"
      ? "The style is calm and professional. Rewrites should maintain a thoughtful, measured tone."
      : "The style is energetic and dynamic. Rewrites should be punchy, exciting, and high-energy.";

  const audienceContext = req.audience
    ? `Target audience: ${req.audience}. Tailor all suggestions to resonate with this audience.`
    : "General YouTube audience.";

  const totalSeconds = req.videoLengthMinutes * 60;
  const interruptCount = Math.floor(totalSeconds / req.interruptFrequencySeconds);

  return `You are a YouTube retention optimization expert. Analyze the script and provide actionable edits.

SCRIPT TO ANALYZE:
"""
${req.scriptText}
"""

PARAMETERS:
- Video length: ${req.videoLengthMinutes} minutes (${totalSeconds} seconds)
- Style: ${req.style}
- Language: ${req.language}
- ${audienceContext}
- Pattern interrupt every: ${req.interruptFrequencySeconds} seconds (approximately ${interruptCount} interrupts needed)

${langInstructions}
${styleInstructions}

TASKS:

1. DROP-OFF MAP (dropoffMap):
Identify weak sections that cause viewers to leave. For each weak part:
- id: unique identifier like "p1", "p2", etc.
- range: { startChar, endChar } - character positions in the original script
- issueTags: array of issues from: "no_promise", "no_conflict", "too_long", "no_example", "low_novelty"
- why: explain why this section is weak (1-2 sentences)
- rewrite: provide the EXACT replacement text (copy-paste ready)

Identify at least 3-5 weak sections. Be specific, not generic.

2. TIGHT SCRIPT (tightScript):
Rewrite the entire script removing ALL filler while keeping the core message.
- Cut redundant phrases, weak transitions, unnecessary explanations
- Keep the style (${req.style}) and language (${req.language})
- Result should be noticeably shorter but complete

3. PATTERN INTERRUPTS (patternInterrupts):
Insert attention-reset moments every ~${req.interruptFrequencySeconds} seconds.
- t: timestamp in "m:ss" format (e.g., "0:30", "1:45")
- type: one of "question", "scene_change", "mini_story", "on_screen_text", "visual_gag"
- line: exact words to say at this moment (copy-paste ready)
- notes: brief production note (what to show/do)

Timestamps must be within 0:00 to ${req.videoLengthMinutes - 1}:59. Generate ~${interruptCount} interrupts.

4. B-ROLL / VISUALS (broll):
Timestamped visual suggestions to maintain engagement.
- t: timestamp in "m:ss" format
- visual: specific visual idea (not generic like "show something related")
- onScreenText: text to display on screen (can be empty string if none)

Generate at least ${Math.max(5, Math.floor(req.videoLengthMinutes * 1.5))} b-roll suggestions.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure. No markdown, no explanation, no text outside JSON:

{
  "dropoffMap": [
    {
      "id": "p1",
      "range": { "startChar": 0, "endChar": 120 },
      "issueTags": ["no_promise", "too_long"],
      "why": "...",
      "rewrite": "..."
    }
  ],
  "tightScript": { "text": "..." },
  "patternInterrupts": [
    {
      "t": "0:30",
      "type": "question",
      "line": "...",
      "notes": "..."
    }
  ],
  "broll": [
    {
      "t": "0:45",
      "visual": "...",
      "onScreenText": "..."
    }
  ]
}

CRITICAL: Output ONLY the JSON object. No text before or after. No markdown code blocks.`;
}
