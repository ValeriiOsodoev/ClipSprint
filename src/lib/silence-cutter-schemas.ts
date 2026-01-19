/**
 * Silence Cutter - Zod Schemas for API Validation
 * 
 * Strict validation for LLM params API request/response.
 */

import { z } from "zod";

// ============================================
// Request Schema
// ============================================

export const paramsRequestSchema = z.object({
  language: z.enum(["ru", "en"]),
  preset: z.enum(["gentle", "normal", "aggressive"]),
  contentType: z.enum(["talking_head", "tutorial", "podcast", "screen_recording"]),
  stats: z.object({
    noiseFloorRms: z.number().min(0),
    rmsP10: z.number().min(0),
    rmsP50: z.number().min(0),
    rmsP90: z.number().min(0),
  }),
  initialSegments: z.array(
    z.object({
      startSeconds: z.number().min(0),
      endSeconds: z.number().min(0),
    })
  ),
});

export type ParamsRequest = z.infer<typeof paramsRequestSchema>;

// ============================================
// Response Schema (strict ranges)
// ============================================

export const paramsResponseSchema = z.object({
  energyMultiplier: z.number().min(1.5).max(6.0),
  minimumSilenceMs: z.number().min(250).max(1500),
  minimumSpeechMs: z.number().min(100).max(500),
  mergeGapMs: z.number().min(100).max(400),
  keepShortPausesUnderMs: z.number().min(150).max(600),
  prePadMs: z.number().min(80).max(400),
  postPadMs: z.number().min(80).max(400),
  maxJumpCutRatePerMinute: z.number().min(10).max(40),
  notes: z.string(),
});

export type ParamsResponse = z.infer<typeof paramsResponseSchema>;

// ============================================
// Error Response Schema
// ============================================

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.enum(["BAD_REQUEST", "LLM_ERROR", "PARSE_ERROR", "RATE_LIMIT"]),
    message: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ============================================
// Default Parameters (fallback if LLM unavailable)
// ============================================

export const DEFAULT_PARAMS: ParamsResponse = {
  energyMultiplier: 2.5,
  minimumSilenceMs: 500,
  minimumSpeechMs: 200,
  mergeGapMs: 200,
  keepShortPausesUnderMs: 300,
  prePadMs: 150,
  postPadMs: 180,
  maxJumpCutRatePerMinute: 25,
  notes: "Default parameters (LLM unavailable)",
};

/**
 * Get default params based on preset (used as fallback)
 */
export function getDefaultParamsForPreset(
  preset: "gentle" | "normal" | "aggressive"
): ParamsResponse {
  switch (preset) {
    case "gentle":
      return {
        energyMultiplier: 2.0,
        minimumSilenceMs: 800,
        minimumSpeechMs: 200,
        mergeGapMs: 300,
        keepShortPausesUnderMs: 500,
        prePadMs: 200,
        postPadMs: 250,
        maxJumpCutRatePerMinute: 15,
        notes: "Gentle preset: conservative cuts, preserves natural pacing",
      };
    case "aggressive":
      return {
        energyMultiplier: 3.5,
        minimumSilenceMs: 300,
        minimumSpeechMs: 150,
        mergeGapMs: 150,
        keepShortPausesUnderMs: 200,
        prePadMs: 100,
        postPadMs: 120,
        maxJumpCutRatePerMinute: 35,
        notes: "Aggressive preset: tight cuts, fast pacing",
      };
    default:
      return DEFAULT_PARAMS;
  }
}
