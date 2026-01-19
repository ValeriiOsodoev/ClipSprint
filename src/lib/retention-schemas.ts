import { z } from "zod";

// Request schema
export const analyzeRequestSchema = z.object({
  scriptText: z.string().min(1, "Script text is required").max(50000),
  videoLengthMinutes: z.union([
    z.literal(2),
    z.literal(5),
    z.literal(10),
    z.literal(20),
  ]),
  style: z.union([z.literal("calm"), z.literal("energetic")]),
  language: z.union([z.literal("ru"), z.literal("en")]).default("ru"),
  interruptFrequencySeconds: z
    .union([z.literal(20), z.literal(30), z.literal(45), z.literal(60)])
    .default(30),
  audience: z.string().max(200).default(""),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// Response schemas
const issueTagSchema = z.union([
  z.literal("no_promise"),
  z.literal("no_conflict"),
  z.literal("too_long"),
  z.literal("no_example"),
  z.literal("low_novelty"),
]);

const dropoffItemSchema = z.object({
  id: z.string(),
  range: z.object({
    startChar: z.number().int().min(0),
    endChar: z.number().int().min(0),
  }),
  issueTags: z.array(issueTagSchema).min(1),
  why: z.string().min(1),
  rewrite: z.string().min(1),
});

const tightScriptSchema = z.object({
  text: z.string().min(1),
});

const timestampRegex = /^\d{1,2}:\d{2}$/;

const interruptTypeSchema = z.union([
  z.literal("question"),
  z.literal("scene_change"),
  z.literal("mini_story"),
  z.literal("on_screen_text"),
  z.literal("visual_gag"),
]);

const patternInterruptSchema = z.object({
  t: z.string().regex(timestampRegex, "Timestamp must be in m:ss format"),
  type: interruptTypeSchema,
  line: z.string().min(1),
  notes: z.string(),
});

const brollItemSchema = z.object({
  t: z.string().regex(timestampRegex, "Timestamp must be in m:ss format"),
  visual: z.string().min(1),
  onScreenText: z.string(),
});

export const analyzeResponseSchema = z.object({
  dropoffMap: z.array(dropoffItemSchema).min(1),
  tightScript: tightScriptSchema,
  patternInterrupts: z.array(patternInterruptSchema).min(1),
  broll: z.array(brollItemSchema).min(1),
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

// Error types
export type AnalyzeErrorCode = "BAD_REQUEST" | "LLM_ERROR" | "PARSE_ERROR" | "RATE_LIMIT";

export type AnalyzeApiError = {
  error: {
    code: AnalyzeErrorCode;
    message: string;
  };
};
