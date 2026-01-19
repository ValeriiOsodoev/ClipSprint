/**
 * Silence Cutter - LLM Prompt Builder
 * 
 * Builds the prompt for the LLM to analyze audio stats and recommend
 * optimal cut parameters for natural-looking silence removal.
 * 
 * The LLM does NOT listen to raw audio. Instead it receives:
 * - Summary stats: noiseFloor, RMS percentiles, dynamic range
 * - Initial detected speech segments
 * - User-selected preset and content type
 * 
 * The LLM returns parameters that make cuts feel natural.
 */

import type { ParamsRequest } from "./silence-cutter-schemas";

export function buildParamsPrompt(request: ParamsRequest): string {
  const { preset, contentType, stats, initialSegments } = request;

  // Calculate some derived stats
  const dynamicRange = stats.rmsP90 - stats.rmsP10;
  const snr = stats.rmsP50 / Math.max(stats.noiseFloorRms, 0.0001);
  const totalSegments = initialSegments.length;
  const avgSegmentDuration = totalSegments > 0
    ? initialSegments.reduce((sum, s) => sum + (s.endSeconds - s.startSeconds), 0) / totalSegments
    : 0;
  const totalSpeechTime = initialSegments.reduce((sum, s) => sum + (s.endSeconds - s.startSeconds), 0);
  const totalVideoTime = initialSegments.length > 0 
    ? initialSegments[initialSegments.length - 1].endSeconds 
    : 0;
  const speechRatio = totalVideoTime > 0 ? totalSpeechTime / totalVideoTime : 0;

  return `You are an audio engineer AI that recommends silence-cutting parameters for video editing.

TASK:
Analyze the provided audio statistics and initial speech segments, then recommend parameters that will produce NATURAL-LOOKING cuts. The goal is to remove dead air without making the video feel artificially fast or robotic.

AUDIO ANALYSIS SUMMARY:
- Noise floor RMS: ${stats.noiseFloorRms.toFixed(6)}
- RMS 10th percentile: ${stats.rmsP10.toFixed(6)}
- RMS 50th percentile (median): ${stats.rmsP50.toFixed(6)}
- RMS 90th percentile: ${stats.rmsP90.toFixed(6)}
- Dynamic range (P90-P10): ${dynamicRange.toFixed(6)}
- Signal-to-noise ratio: ${snr.toFixed(2)}x
- Initial segments detected: ${totalSegments}
- Average segment duration: ${avgSegmentDuration.toFixed(2)}s
- Speech ratio: ${(speechRatio * 100).toFixed(1)}%

USER SETTINGS:
- Preset: ${preset.toUpperCase()}
- Content type: ${contentType.replace("_", " ")}

PRESET GUIDELINES:
- GENTLE: Preserve natural pacing, only remove obvious long pauses. Good for podcasts, interviews.
- NORMAL: Balanced cuts that feel professional. Good for most content.
- AGGRESSIVE: Tight cuts for fast-paced content. Good for tutorials, energetic videos.

CONTENT TYPE CONSIDERATIONS:
- talking_head: Preserve breathing room, avoid cutting emotion/emphasis pauses
- tutorial: Can be tighter, viewers expect efficiency
- podcast: Conversational feel is important, preserve natural rhythm
- screen_recording: Usually can be tight, focus on action

NATURAL CUT RULES (must inform your recommendations):
1. keepShortPausesUnderMs: Natural speech has micro-pauses (200-400ms). Cutting these makes speech sound unnatural.
2. prePadMs/postPadMs: Audio needs room to breathe. Too little padding = cut mid-word. Too much = defeats purpose.
3. maxJumpCutRatePerMinute: More than 30 cuts/min feels "machine gun". Podcast/gentle content: 10-20 cuts/min max.
4. minimumSilenceMs: Only silence LONGER than this gets cut. Short pauses are natural, keep them.
5. mergeGapMs: If two speech segments are separated by tiny gap, merge them instead of creating micro-cut.

PARAMETER RANGES (you MUST stay within these):
- energyMultiplier: 1.5 - 6.0 (higher = more aggressive detection)
- minimumSilenceMs: 250 - 1500 (minimum silence to cut)
- minimumSpeechMs: 100 - 500 (ignore speech shorter than this)
- mergeGapMs: 100 - 400 (merge segments closer than this)
- keepShortPausesUnderMs: 150 - 600 (NEVER cut pauses shorter than this)
- prePadMs: 80 - 400 (padding before speech)
- postPadMs: 80 - 400 (padding after speech)
- maxJumpCutRatePerMinute: 10 - 40 (cap on cut density)

RESPOND WITH ONLY A VALID JSON OBJECT (no markdown, no explanation outside JSON):
{
  "energyMultiplier": <number>,
  "minimumSilenceMs": <number>,
  "minimumSpeechMs": <number>,
  "mergeGapMs": <number>,
  "keepShortPausesUnderMs": <number>,
  "prePadMs": <number>,
  "postPadMs": <number>,
  "maxJumpCutRatePerMinute": <number>,
  "notes": "<brief explanation of your reasoning, in ${request.language === "ru" ? "Russian" : "English"}>"
}`;
}
