import type { ClipFactoryRequest } from "@/types/clip-factory";

export function buildClipFactoryPrompt(request: ClipFactoryRequest): string {
  const {
    language,
    targetPlatform,
    minClipSeconds,
    maxClipSeconds,
    style,
    allowProfanity,
    contentType,
    segments,
  } = request;

  const platformName = {
    shorts: "YouTube Shorts",
    reels: "Instagram Reels",
    tiktok: "TikTok",
  }[targetPlatform];

  const styleDesc = style === "energetic" 
    ? "fast-paced, punchy, high energy" 
    : "calm, thoughtful, measured";

  const contentTypeHint = contentType 
    ? `Content type: ${contentType}. Adjust tone accordingly.` 
    : "";

  const profanityRule = allowProfanity 
    ? "Profanity is allowed if present in the source." 
    : "AVOID clips containing profanity. If a great clip has profanity, skip it and find another.";

  // Format segments for the prompt
  const transcriptText = segments
    .map((s) => `[${s.t}] ${s.text}`)
    .join("\n");

  return `You are an expert short-form video editor. Your task is to analyze a timestamped transcript and identify EXACTLY 10 high-quality clip candidates for ${platformName}.

OUTPUT LANGUAGE: All clip titles, cold open lines, subtitles, and explanations MUST be in ${language === "ru" ? "Russian" : "English"}.

PLATFORM: ${platformName}
STYLE: ${styleDesc}
${contentTypeHint}

DURATION CONSTRAINTS:
- Minimum clip duration: ${minClipSeconds} seconds
- Maximum clip duration: ${maxClipSeconds} seconds
- Each clip MUST fall within this range.

PROFANITY RULE: ${profanityRule}

CLIP SELECTION CRITERIA (follow strictly):
1. SELF-CONTAINED: Each clip must make sense without additional context.
2. HIGH SIGNAL MOMENTS: Prioritize:
   - Strong claims or opinions
   - Disagreements or debates
   - Surprising facts or revelations
   - Quick actionable tips
   - Punchlines or payoffs
   - Emotional peaks
3. NO OVERLAP: Clips must not overlap by more than 20% in time range.
4. MOMENTUM START: The cold open line must be punchy—NO greetings, no "so", no filler.
5. NATURAL END: Clips should end at a natural pause or conclusion, not mid-sentence.

SUBTITLE RULES:
- 2-6 subtitle entries per clip
- Each line MAXIMUM 42 characters (mobile readability)
- Split long sentences naturally
- Include speaker emphasis where relevant

OUTPUT FORMAT: Return ONLY valid JSON matching this exact structure:
{
  "clips": [
    {
      "id": "c1",
      "start": "12:34",
      "end": "13:15",
      "startSeconds": 754,
      "endSeconds": 795,
      "durationSeconds": 41,
      "clipTitle": "Short hooky title for ${platformName}",
      "coldOpenLine": "First punchy line of the clip",
      "subtitles": [
        { "startOffsetSeconds": 0, "endOffsetSeconds": 4, "line1": "First subtitle line", "line2": "Optional second line" }
      ],
      "whyThisClipWorks": "Brief reason: tension/curiosity/payoff",
      "containsProfanity": false
    }
  ]
}

CRITICAL: 
- Return EXACTLY 10 clips, no more, no less.
- IDs must be c1 through c10.
- All timestamps must reference actual times from the transcript.
- Duration must equal endSeconds - startSeconds.
- Ensure startSeconds and endSeconds match the start and end timestamp strings.

TRANSCRIPT:
${transcriptText}

Return ONLY the JSON object, no markdown, no explanation.`;
}
