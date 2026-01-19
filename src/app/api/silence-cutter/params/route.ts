/**
 * Silence Cutter - LLM Parameters API Route
 * 
 * POST /api/silence-cutter/params
 * 
 * Receives audio statistics and initial speech segments,
 * returns LLM-recommended parameters for natural-looking silence removal.
 * 
 * The LLM does NOT listen to raw audio. It analyzes:
 * - Summary stats (noise floor, RMS percentiles)
 * - Initial detected segments
 * - User preset and content type
 * 
 * Returns parameters that make cuts feel natural.
 */

import { NextResponse } from "next/server";
import { paramsRequestSchema, paramsResponseSchema, getDefaultParamsForPreset } from "@/lib/silence-cutter-schemas";
import { buildParamsPrompt } from "@/lib/silence-cutter-prompts";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request
    const parseResult = paramsRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: parseResult.error.errors.map((e) => e.message).join("; "),
          },
        },
        { status: 400 }
      );
    }

    const request = parseResult.data;

    // Build prompt for LLM
    const prompt = buildParamsPrompt(request);

    // Get API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback to default params if no API key
      console.warn("GROQ_API_KEY not configured, using default params");
      return NextResponse.json(getDefaultParamsForPreset(request.preset));
    }

    // Call LLM (using Groq)
    const llmResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an audio engineering AI assistant. Output ONLY valid JSON matching the exact schema requested. No markdown code blocks, no explanation outside JSON, just the raw JSON object.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent parameter selection
        max_tokens: 1000,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();

      if (llmResponse.status === 429) {
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMIT",
              message: "Rate limit exceeded. Please try again later.",
            },
          },
          { status: 429 }
        );
      }

      // Fallback to defaults on LLM error
      console.error("LLM request failed:", errorText);
      return NextResponse.json(getDefaultParamsForPreset(request.preset));
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty response from LLM");
      return NextResponse.json(getDefaultParamsForPreset(request.preset));
    }

    // Parse JSON from LLM response
    let parsed;
    try {
      // Try to extract JSON from potential markdown code blocks
      let jsonStr = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse LLM response as JSON:", content);
      return NextResponse.json(
        {
          error: {
            code: "PARSE_ERROR",
            message: "Failed to parse LLM response as JSON",
          },
        },
        { status: 500 }
      );
    }

    // Validate response against schema
    const responseValidation = paramsResponseSchema.safeParse(parsed);
    if (!responseValidation.success) {
      console.error("LLM response validation failed:", responseValidation.error);
      // Return defaults but with a warning in notes
      const defaults = getDefaultParamsForPreset(request.preset);
      return NextResponse.json({
        ...defaults,
        notes: `${defaults.notes} (LLM response was invalid, using defaults)`,
      });
    }

    return NextResponse.json(responseValidation.data);
  } catch (error) {
    console.error("Params API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "LLM_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
