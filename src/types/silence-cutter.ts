/**
 * Silence Cutter - Type Definitions
 * 
 * This tool analyzes video audio to detect silence and produce a tighter edit
 * that still feels natural (no awkward jump cuts mid-word, no "machine gun" pacing).
 */

import type { Lang } from "@/lib/i18n";

// ============================================
// User Configuration Types
// ============================================

export type CutPreset = "gentle" | "normal" | "aggressive";

export type ContentType = "talking_head" | "tutorial" | "podcast" | "screen_recording";

export interface UserSettings {
  preset: CutPreset;
  contentType: ContentType;
  /**
   * Minimum silence duration to consider removing (in ms)
   * User-facing slider: 300ms / 500ms / 800ms
   */
  minSilenceToRemove: number;
  /**
   * "Naturalness" slider value 0-100
   * Higher = more padding, keep more short pauses
   */
  naturalness: number;
  /**
   * If true, use word-aware cutting via transcription (MVP+)
   */
  precisionMode: boolean;
}

// ============================================
// Audio Analysis Types
// ============================================

export interface AudioStats {
  /** Noise floor RMS (median of lowest 10% frames) */
  noiseFloorRms: number;
  /** 10th percentile RMS */
  rmsP10: number;
  /** 50th percentile RMS (median) */
  rmsP50: number;
  /** 90th percentile RMS */
  rmsP90: number;
  /** Total duration in seconds */
  totalDurationSeconds: number;
  /** Frame size used for analysis (ms) */
  frameSizeMs: number;
  /** Sample rate of analyzed audio */
  sampleRate: number;
}

export interface RmsFrame {
  /** Start time in seconds */
  startSeconds: number;
  /** RMS value for this frame */
  rms: number;
}

// ============================================
// Speech Segment Types
// ============================================

export interface SpeechSegment {
  /** Unique ID for this segment */
  id: string;
  /** Start time in seconds */
  startSeconds: number;
  /** End time in seconds */
  endSeconds: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** Whether this segment is enabled (will be kept) */
  enabled: boolean;
  /** Optional label (e.g., first words of the segment) */
  label?: string;
}

export interface DetectionResult {
  /** Initial detected speech segments before LLM refinement */
  initialSegments: SpeechSegment[];
  /** Audio statistics from analysis */
  stats: AudioStats;
  /** Parameters used for detection */
  params: DetectionParams;
}

// ============================================
// LLM-Refined Parameters Types
// ============================================

export interface DetectionParams {
  /**
   * Multiplier for noise floor to determine speech threshold
   * Range: 1.5 - 6.0
   */
  energyMultiplier: number;
  /**
   * Minimum silence duration to cut (ms)
   * Range: 250 - 1500
   */
  minimumSilenceMs: number;
  /**
   * Minimum speech duration to keep (ms)
   * Range: 100 - 500
   */
  minimumSpeechMs: number;
  /**
   * Merge speech segments separated by gaps smaller than this (ms)
   * Range: 100 - 400
   */
  mergeGapMs: number;
  /**
   * Do NOT cut silences shorter than this (ms)
   * Range: 150 - 600
   */
  keepShortPausesUnderMs: number;
  /**
   * Padding added before speech starts (ms)
   * Range: 80 - 400
   */
  prePadMs: number;
  /**
   * Padding added after speech ends (ms)
   * Range: 80 - 400
   */
  postPadMs: number;
  /**
   * Maximum cuts per minute (to avoid "machine gun" pacing)
   * Range: 10 - 40
   */
  maxJumpCutRatePerMinute: number;
}

export interface LlmParamsResponse extends DetectionParams {
  /** Optional notes/explanation from LLM */
  notes: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface ParamsApiRequest {
  language: Lang;
  preset: CutPreset;
  contentType: ContentType;
  stats: {
    noiseFloorRms: number;
    rmsP10: number;
    rmsP50: number;
    rmsP90: number;
  };
  initialSegments: Array<{
    startSeconds: number;
    endSeconds: number;
  }>;
}

export interface ParamsApiSuccessResponse extends LlmParamsResponse {}

export interface ParamsApiErrorResponse {
  error: {
    code: "BAD_REQUEST" | "LLM_ERROR" | "PARSE_ERROR" | "RATE_LIMIT";
    message: string;
  };
}

export type ParamsApiResponse = ParamsApiSuccessResponse | ParamsApiErrorResponse;

// ============================================
// Export Types
// ============================================

export interface CutListJson {
  sourceFileName: string;
  fpsAssumed: number;
  totalDurationOriginal: number;
  totalDurationAfterCuts: number;
  totalTimeRemoved: number;
  numberOfCuts: number;
  keptSegments: Array<{
    startSeconds: number;
    endSeconds: number;
  }>;
  exportedAt: string;
}

// ============================================
// Processing State Types
// ============================================

export type ProcessingStage = 
  | "idle"
  | "loading_video"
  | "extracting_audio"
  | "transcribing"
  | "analyzing_pauses"
  | "generating_segments"
  | "analyzing_audio"
  | "fetching_params"
  | "refining_segments"
  | "exporting"
  | "complete"
  | "error";

export interface ProcessingState {
  stage: ProcessingStage;
  progress: number; // 0-100
  message: string;
  error?: string;
}

// ============================================
// History Entry Types
// ============================================

export interface SilenceCutterHistoryEntry {
  id: string;
  timestamp: number;
  fileName: string;
  originalDuration: number;
  finalDuration: number;
  timeRemoved: number;
  numberOfCuts: number;
  preset: CutPreset;
  contentType: ContentType;
  /** Stored segments for re-export */
  keptSegments: Array<{
    startSeconds: number;
    endSeconds: number;
  }>;
}
