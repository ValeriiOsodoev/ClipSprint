import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AnalyzeApiError,
} from "@/lib/retention-schemas";

export type { AnalyzeRequest, AnalyzeResponse, AnalyzeApiError };

export type AnalyzeResult =
  | { success: true; data: AnalyzeResponse }
  | { success: false; error: AnalyzeApiError["error"] };
