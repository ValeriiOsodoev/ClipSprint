import { NextResponse } from "next/server";
import { clipFactoryRequestSchema, clipFactoryResponseSchema } from "@/lib/clip-factory-schemas";
import { buildClipFactoryPrompt } from "@/lib/clip-factory-prompts";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request
    const parseResult = clipFactoryRequestSchema.safeParse(body);
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
    
    // Build prompt
    const prompt = buildClipFactoryPrompt(request);
    
    // Call LLM (using Groq)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: { code: "LLM_ERROR", message: "API key not configured" } },
        { status: 500 }
      );
    }
    
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
            content: "You are a JSON-only assistant. Output valid JSON matching the exact schema requested. No markdown, no explanation, just JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });
    
    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      
      if (llmResponse.status === 429) {
        return NextResponse.json(
          { error: { code: "RATE_LIMIT", message: "Rate limit exceeded. Please try again later." } },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: { code: "LLM_ERROR", message: `LLM request failed: ${errorText}` } },
        { status: 500 }
      );
    }
    
    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: { code: "LLM_ERROR", message: "Empty response from LLM" } },
        { status: 500 }
      );
    }
    
    // Parse JSON from LLM response
    let parsed;
    try {
      // Clean potential markdown wrappers
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      return NextResponse.json(
        { error: { code: "PARSE_ERROR", message: "Failed to parse LLM JSON output" } },
        { status: 500 }
      );
    }
    
    // Validate response schema
    const responseResult = clipFactoryResponseSchema.safeParse(parsed);
    if (!responseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "PARSE_ERROR",
            message: `Invalid clip structure: ${responseResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ")}`,
          },
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(responseResult.data);
  } catch (error) {
    console.error("Clip Factory API error:", error);
    return NextResponse.json(
      { error: { code: "LLM_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
