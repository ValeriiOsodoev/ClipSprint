import { z } from "zod";

// Request schema
export const clipFactoryRequestSchema = z.object({
  language: z.enum(["ru", "en"]),
  targetPlatform: z.enum(["shorts", "reels", "tiktok"]),
  minClipSeconds: z.union([z.literal(15), z.literal(20), z.literal(30)]),
  maxClipSeconds: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  style: z.enum(["calm", "energetic"]),
  allowProfanity: z.boolean(),
  contentType: z.enum(["podcast", "tutorial", "gaming", "interview", "commentary", ""]),
  segments: z.array(
    z.object({
      t: z.string(),
      tSeconds: z.number(),
      text: z.string(),
    })
  ).min(30, "Need at least 30 timestamped segments"),
});

// Subtitle schema
export const subtitleSchema = z.object({
  startOffsetSeconds: z.number(),
  endOffsetSeconds: z.number(),
  line1: z.string().max(42),
  line2: z.string().max(42).optional(),
});

// Single clip schema
export const clipSchema = z.object({
  id: z.string(),
  start: z.string(),
  end: z.string(),
  startSeconds: z.number(),
  endSeconds: z.number(),
  durationSeconds: z.number(),
  clipTitle: z.string(),
  coldOpenLine: z.string(),
  subtitles: z.array(subtitleSchema).min(2).max(6),
  whyThisClipWorks: z.string(),
  containsProfanity: z.boolean(),
});

// Response schema
export const clipFactoryResponseSchema = z.object({
  clips: z.array(clipSchema).length(10),
});

// Error schema
export const clipFactoryErrorSchema = z.object({
  error: z.object({
    code: z.enum(["BAD_REQUEST", "LLM_ERROR", "PARSE_ERROR", "RATE_LIMIT"]),
    message: z.string(),
  }),
});

export type ClipFactoryRequestSchema = z.infer<typeof clipFactoryRequestSchema>;
export type ClipFactoryResponseSchema = z.infer<typeof clipFactoryResponseSchema>;
