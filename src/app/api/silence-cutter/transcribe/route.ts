import { NextRequest, NextResponse } from "next/server";

// Groq Whisper API for transcription
const GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: TranscriptionWord[];
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Create form data for Groq API
    const groqFormData = new FormData();
    groqFormData.append("file", audioFile);
    groqFormData.append("model", "whisper-large-v3-turbo");
    groqFormData.append("response_format", "verbose_json");
    groqFormData.append("timestamp_granularities[]", "word");
    groqFormData.append("timestamp_granularities[]", "segment");

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: `Transcription failed: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Extract segments with word-level timestamps
    const transcriptionResult: TranscriptionResult = {
      text: result.text || "",
      segments: (result.segments || []).map((seg: {
        id?: number;
        start?: number;
        end?: number;
        text?: string;
        words?: Array<{ word?: string; start?: number; end?: number }>;
      }, index: number) => ({
        id: seg.id ?? index,
        start: seg.start ?? 0,
        end: seg.end ?? 0,
        text: seg.text ?? "",
        words: seg.words?.map((w) => ({
          word: w.word ?? "",
          start: w.start ?? 0,
          end: w.end ?? 0,
        })),
      })),
      language: result.language || "unknown",
      duration: result.duration || 0,
    };

    return NextResponse.json(transcriptionResult);
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Internal server error during transcription" },
      { status: 500 }
    );
  }
}
