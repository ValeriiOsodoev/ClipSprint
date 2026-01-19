import type { GenerateRequest, GenerateResponse, ApiError } from "@/lib/schemas";

export type { GenerateRequest, GenerateResponse, ApiError };

export type ApiResult =
  | { success: true; data: GenerateResponse }
  | { success: false; error: ApiError["error"] };
