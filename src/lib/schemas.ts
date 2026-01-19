import { z } from "zod";

// Request schema
export const generateRequestSchema = z.object({
  niche: z.string().min(1, "Niche is required").max(200),
  topic: z.string().min(1, "Topic is required").max(500),
  durationMinutes: z.union([
    z.literal(2),
    z.literal(5),
    z.literal(10),
    z.literal(20),
  ]),
  style: z.union([z.literal("calm"), z.literal("energetic")]),
  goal: z.union([z.literal("views"), z.literal("subs"), z.literal("sales")]),
  outputLanguage: z.union([z.literal("ru"), z.literal("en")]).default("ru"),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

// Response schemas
const titleLabelSchema = z.union([
  z.literal("SEO"),
  z.literal("click"),
  z.literal("balanced"),
]);

const titleSchema = z.object({
  label: titleLabelSchema,
  text: z.string().min(1),
});

const hookSecondsSchema = z.number().int().min(5).max(15);

const hookSchema = z.object({
  text: z.string().min(1),
  seconds: hookSecondsSchema,
});

const timestampRegex = /^\d{1,2}:\d{2}$/;

const outlineItemSchema = z.object({
  t: z.string().regex(timestampRegex, "Timestamp must be in m:ss format"),
  segment: z.string().min(1),
  notes: z.string(),
});

const introSchema = z.object({
  text: z.string().min(1),
});

const ctaSchema = z.object({
  text: z.string().min(1),
});

export const generateResponseSchema = z.object({
  titles: z.array(titleSchema).length(15),
  hooks: z.array(hookSchema).length(10),
  outline: z.array(outlineItemSchema).min(3),
  intro: introSchema,
  cta: ctaSchema,
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

// Error schema
export const errorCodeSchema = z.union([
  z.literal("BAD_REQUEST"),
  z.literal("LLM_ERROR"),
  z.literal("PARSE_ERROR"),
  z.literal("RATE_LIMIT"),
]);

export type ErrorCode = z.infer<typeof errorCodeSchema>;

export type ApiError = {
  error: {
    code: ErrorCode;
    message: string;
  };
};
