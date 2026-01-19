import { NextRequest, NextResponse } from "next/server";
import {
  analyzeRequestSchema,
  analyzeResponseSchema,
  type AnalyzeApiError,
  type AnalyzeResponse,
} from "@/lib/retention-schemas";
import { buildAnalyzePrompt } from "@/lib/retention-prompts";

function errorResponse(
  code: AnalyzeApiError["error"]["code"],
  message: string,
  status: number
) {
  const body: AnalyzeApiError = { error: { code, message } };
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid JSON in request body", 400);
  }

  // Validate request
  const parseResult = analyzeRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const message = parseResult.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return errorResponse("BAD_REQUEST", message, 400);
  }

  const req = parseResult.data;

  // Get API config from env
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  if (!apiKey) {
    return errorResponse("LLM_ERROR", "API key not configured", 500);
  }

  // Build prompt
  const prompt = buildAnalyzePrompt(req);

  // Call LLM
  let llmResponse: Response;
  try {
    llmResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a YouTube retention expert. Output ONLY valid JSON, no markdown or explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return errorResponse("LLM_ERROR", `Failed to call LLM: ${message}`, 502);
  }

  // Handle rate limit
  if (llmResponse.status === 429) {
    return errorResponse(
      "RATE_LIMIT",
      "Rate limit exceeded. Please try again later.",
      429
    );
  }

  // Handle other errors
  if (!llmResponse.ok) {
    let errorDetail = `Status ${llmResponse.status}`;
    try {
      const errBody = (await llmResponse.json()) as {
        error?: { message?: string };
      };
      if (errBody.error?.message) {
        errorDetail = errBody.error.message;
      }
    } catch {
      // ignore parse errors
    }
    return errorResponse("LLM_ERROR", `LLM API error: ${errorDetail}`, 502);
  }

  // Parse LLM response
  type ChatCompletion = {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  let llmData: ChatCompletion;
  try {
    llmData = (await llmResponse.json()) as ChatCompletion;
  } catch {
    return errorResponse("LLM_ERROR", "Failed to parse LLM response", 502);
  }

  const content = llmData.choices?.[0]?.message?.content;
  if (!content) {
    return errorResponse("PARSE_ERROR", "LLM returned empty content", 500);
  }

  // Parse JSON from content (handle potential markdown wrapping)
  let jsonContent = content.trim();

  // Remove markdown code block if present
  if (jsonContent.startsWith("```")) {
    const lines = jsonContent.split("\n");
    lines.shift(); // Remove opening ```json or ```
    if (lines[lines.length - 1]?.trim() === "```") {
      lines.pop(); // Remove closing ```
    }
    jsonContent = lines.join("\n");
  }

  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(jsonContent);
  } catch {
    return errorResponse(
      "PARSE_ERROR",
      "LLM output is not valid JSON. Please try again.",
      500
    );
  }

  // Validate response schema
  const responseResult = analyzeResponseSchema.safeParse(parsedContent);
  if (!responseResult.success) {
    const message = responseResult.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return errorResponse(
      "PARSE_ERROR",
      `LLM output does not match schema: ${message}`,
      500
    );
  }

  const responseData: AnalyzeResponse = responseResult.data;

  return NextResponse.json(responseData);
}
