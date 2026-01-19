/**
 * Silence Cutter - Audio Analysis Library
 * 
 * Implements Stage A of the 2-stage pipeline: Signal Detection (deterministic, fast)
 * 
 * ALGORITHM:
 * 1) Extract audio track to mono PCM for analysis
 * 2) Compute per-frame energy envelope (RMS in 10-20ms frames)
 * 3) Estimate noise floor: median of the lowest 10% RMS frames
 * 4) Mark frames as speech if RMS > noiseFloor * energyMultiplier
 * 5) Apply VAD-style smoothing:
 *    - minimumSpeechMs: ignore speech segments shorter than this
 *    - minimumSilenceMs: silence must last >= this to create a cut
 *    - mergeGapMs: merge speech segments separated by tiny gaps
 * 
 * All processing happens client-side using Web Audio API.
 */

import type { 
  AudioStats, 
  RmsFrame, 
  SpeechSegment, 
  DetectionParams,
  DetectionResult 
} from "@/types/silence-cutter";
import { DEFAULT_PARAMS } from "./silence-cutter-schemas";

// ============================================
// Constants
// ============================================

/** Frame size for RMS analysis in milliseconds */
const FRAME_SIZE_MS = 20;

/** Target sample rate for analysis (downsampling for speed) */
const ANALYSIS_SAMPLE_RATE = 16000;

// ============================================
// Audio Extraction
// ============================================

/**
 * Extract audio from video file as mono PCM samples
 * Uses Web Audio API's AudioContext for decoding
 */
export async function extractAudioFromVideo(
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<{ samples: Float32Array; sampleRate: number; duration: number }> {
  onProgress?.(10);

  // Read file as ArrayBuffer
  const arrayBuffer = await videoFile.arrayBuffer();
  onProgress?.(30);

  // Create AudioContext for decoding
  const audioContext = new AudioContext({ sampleRate: ANALYSIS_SAMPLE_RATE });
  
  try {
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    onProgress?.(70);

    // Convert to mono by averaging channels
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const monoSamples = new Float32Array(length);

    for (let ch = 0; ch < numberOfChannels; ch++) {
      const channelData = audioBuffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        monoSamples[i] += channelData[i] / numberOfChannels;
      }
    }

    onProgress?.(100);

    return {
      samples: monoSamples,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
    };
  } finally {
    await audioContext.close();
  }
}

// ============================================
// RMS Calculation
// ============================================

/**
 * Calculate RMS (Root Mean Square) for a frame of samples
 * RMS is a measure of the "energy" or "loudness" of the signal
 */
function calculateRms(samples: Float32Array, start: number, end: number): number {
  let sum = 0;
  const count = end - start;
  
  for (let i = start; i < end; i++) {
    sum += samples[i] * samples[i];
  }
  
  return Math.sqrt(sum / count);
}

/**
 * Compute RMS envelope for entire audio
 * Returns an array of RMS values, one per frame
 */
export function computeRmsEnvelope(
  samples: Float32Array,
  sampleRate: number,
  frameSizeMs: number = FRAME_SIZE_MS
): RmsFrame[] {
  const frameSizeSamples = Math.floor((frameSizeMs / 1000) * sampleRate);
  const frames: RmsFrame[] = [];
  
  for (let i = 0; i < samples.length; i += frameSizeSamples) {
    const end = Math.min(i + frameSizeSamples, samples.length);
    const rms = calculateRms(samples, i, end);
    const startSeconds = i / sampleRate;
    
    frames.push({ startSeconds, rms });
  }
  
  return frames;
}

// ============================================
// Statistics Calculation
// ============================================

/**
 * Calculate audio statistics from RMS frames
 * These stats are sent to the LLM for parameter tuning
 */
export function calculateAudioStats(
  frames: RmsFrame[],
  sampleRate: number,
  totalDuration: number
): AudioStats {
  // Sort RMS values for percentile calculation
  const sortedRms = frames.map(f => f.rms).sort((a, b) => a - b);
  
  const getPercentile = (p: number): number => {
    const index = Math.floor((p / 100) * sortedRms.length);
    return sortedRms[Math.min(index, sortedRms.length - 1)];
  };

  // Noise floor = median of lowest 10% frames
  const lowest10PercentCount = Math.max(1, Math.floor(sortedRms.length * 0.1));
  const lowest10Percent = sortedRms.slice(0, lowest10PercentCount);
  const noiseFloor = lowest10Percent[Math.floor(lowest10Percent.length / 2)];

  return {
    noiseFloorRms: noiseFloor,
    rmsP10: getPercentile(10),
    rmsP50: getPercentile(50),
    rmsP90: getPercentile(90),
    totalDurationSeconds: totalDuration,
    frameSizeMs: FRAME_SIZE_MS,
    sampleRate,
  };
}

// ============================================
// Initial Speech Detection
// ============================================

/**
 * Detect initial speech segments based on RMS threshold
 * Stage A, Step 1: Mark frames as speech if RMS > noiseFloor * energyMultiplier
 */
function detectRawSpeechFrames(
  frames: RmsFrame[],
  noiseFloor: number,
  energyMultiplier: number
): boolean[] {
  const threshold = noiseFloor * energyMultiplier;
  return frames.map(f => f.rms > threshold);
}

/**
 * Convert frame-level speech detection to segment list
 */
function framesToSegments(
  isSpeech: boolean[],
  frames: RmsFrame[],
  frameDurationMs: number
): Array<{ startSeconds: number; endSeconds: number }> {
  const segments: Array<{ startSeconds: number; endSeconds: number }> = [];
  let segmentStart: number | null = null;

  for (let i = 0; i < isSpeech.length; i++) {
    if (isSpeech[i] && segmentStart === null) {
      // Start of speech
      segmentStart = frames[i].startSeconds;
    } else if (!isSpeech[i] && segmentStart !== null) {
      // End of speech
      const endSeconds = frames[i].startSeconds;
      segments.push({ startSeconds: segmentStart, endSeconds });
      segmentStart = null;
    }
  }

  // Handle case where speech extends to end
  if (segmentStart !== null) {
    const lastFrame = frames[frames.length - 1];
    segments.push({
      startSeconds: segmentStart,
      endSeconds: lastFrame.startSeconds + frameDurationMs / 1000,
    });
  }

  return segments;
}

// ============================================
// VAD-Style Smoothing
// ============================================

/**
 * Merge segments that are separated by gaps smaller than mergeGapMs
 */
function mergeCloseSegments(
  segments: Array<{ startSeconds: number; endSeconds: number }>,
  mergeGapMs: number
): Array<{ startSeconds: number; endSeconds: number }> {
  if (segments.length === 0) return [];

  const mergeGapSec = mergeGapMs / 1000;
  const merged: Array<{ startSeconds: number; endSeconds: number }> = [{ ...segments[0] }];

  for (let i = 1; i < segments.length; i++) {
    const current = segments[i];
    const last = merged[merged.length - 1];

    if (current.startSeconds - last.endSeconds < mergeGapSec) {
      // Merge: extend the last segment
      last.endSeconds = current.endSeconds;
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/**
 * Remove speech segments shorter than minimumSpeechMs
 */
function filterShortSpeech(
  segments: Array<{ startSeconds: number; endSeconds: number }>,
  minimumSpeechMs: number
): Array<{ startSeconds: number; endSeconds: number }> {
  const minDurationSec = minimumSpeechMs / 1000;
  return segments.filter(s => (s.endSeconds - s.startSeconds) >= minDurationSec);
}

/**
 * Keep short pauses (don't create cuts for silences shorter than keepShortPausesUnderMs)
 * This is done by merging segments separated by short silences
 */
function keepShortPauses(
  segments: Array<{ startSeconds: number; endSeconds: number }>,
  keepShortPausesUnderMs: number
): Array<{ startSeconds: number; endSeconds: number }> {
  // This is essentially the same as mergeCloseSegments but with a different threshold
  return mergeCloseSegments(segments, keepShortPausesUnderMs);
}

/**
 * Add padding around speech segments
 * prePadMs before speech starts, postPadMs after speech ends
 */
function addPadding(
  segments: Array<{ startSeconds: number; endSeconds: number }>,
  prePadMs: number,
  postPadMs: number,
  totalDuration: number
): Array<{ startSeconds: number; endSeconds: number }> {
  const prePadSec = prePadMs / 1000;
  const postPadSec = postPadMs / 1000;

  return segments.map(s => ({
    startSeconds: Math.max(0, s.startSeconds - prePadSec),
    endSeconds: Math.min(totalDuration, s.endSeconds + postPadSec),
  }));
}

/**
 * Limit cut rate to maxJumpCutRatePerMinute
 * If there are too many cuts, merge some segments to reduce cut density
 */
function limitCutRate(
  segments: Array<{ startSeconds: number; endSeconds: number }>,
  maxJumpCutRatePerMinute: number,
  totalDuration: number
): Array<{ startSeconds: number; endSeconds: number }> {
  if (segments.length <= 1) return segments;

  const totalMinutes = totalDuration / 60;
  const maxCuts = Math.ceil(maxJumpCutRatePerMinute * totalMinutes);
  const currentCuts = segments.length - 1;

  if (currentCuts <= maxCuts) return segments;

  // Need to reduce cuts by merging some segments
  // Strategy: merge segments with smallest gaps first
  const result = [...segments];
  
  while (result.length - 1 > maxCuts && result.length > 1) {
    // Find the smallest gap
    let smallestGapIndex = 0;
    let smallestGap = Infinity;

    for (let i = 0; i < result.length - 1; i++) {
      const gap = result[i + 1].startSeconds - result[i].endSeconds;
      if (gap < smallestGap) {
        smallestGap = gap;
        smallestGapIndex = i;
      }
    }

    // Merge the segments
    result[smallestGapIndex].endSeconds = result[smallestGapIndex + 1].endSeconds;
    result.splice(smallestGapIndex + 1, 1);
  }

  return result;
}

/**
 * Final merge pass: ensure no overlapping segments after padding
 */
function mergeOverlapping(
  segments: Array<{ startSeconds: number; endSeconds: number }>
): Array<{ startSeconds: number; endSeconds: number }> {
  if (segments.length === 0) return [];

  const sorted = [...segments].sort((a, b) => a.startSeconds - b.startSeconds);
  const merged: Array<{ startSeconds: number; endSeconds: number }> = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.startSeconds <= last.endSeconds) {
      // Overlapping or adjacent: merge
      last.endSeconds = Math.max(last.endSeconds, current.endSeconds);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

// ============================================
// Main Detection Pipeline
// ============================================

/**
 * Run the full audio analysis and speech detection pipeline
 * Stage A: Deterministic signal detection
 */
export function runInitialDetection(
  samples: Float32Array,
  sampleRate: number,
  totalDuration: number,
  params: Partial<DetectionParams> = {}
): DetectionResult {
  // Use default params for initial detection
  const detectionParams: DetectionParams = {
    ...DEFAULT_PARAMS,
    ...params,
  };

  // Step 1: Compute RMS envelope
  const frames = computeRmsEnvelope(samples, sampleRate, FRAME_SIZE_MS);

  // Step 2: Calculate stats
  const stats = calculateAudioStats(frames, sampleRate, totalDuration);

  // Step 3: Initial speech detection
  const isSpeech = detectRawSpeechFrames(
    frames,
    stats.noiseFloorRms,
    detectionParams.energyMultiplier
  );

  // Step 4: Convert to segments
  let segments = framesToSegments(isSpeech, frames, FRAME_SIZE_MS);

  // Step 5: VAD smoothing - merge close segments
  segments = mergeCloseSegments(segments, detectionParams.mergeGapMs);

  // Step 6: Filter short speech
  segments = filterShortSpeech(segments, detectionParams.minimumSpeechMs);

  // Convert to SpeechSegment type
  const initialSegments: SpeechSegment[] = segments.map((s, i) => ({
    id: `seg-${i}`,
    startSeconds: s.startSeconds,
    endSeconds: s.endSeconds,
    durationSeconds: s.endSeconds - s.startSeconds,
    enabled: true,
  }));

  return {
    initialSegments,
    stats,
    params: detectionParams,
  };
}

/**
 * Refine segments using LLM-provided parameters
 * Stage B: Apply smart parameters + natural cut rules
 */
export function refineSegments(
  initialSegments: SpeechSegment[],
  params: DetectionParams,
  totalDuration: number
): SpeechSegment[] {
  // Convert to simple format for processing
  let segments = initialSegments
    .filter(s => s.enabled)
    .map(s => ({
      startSeconds: s.startSeconds,
      endSeconds: s.endSeconds,
    }));

  // Apply natural cut rules in order:

  // 1. Keep short pauses (merge segments separated by pauses shorter than threshold)
  segments = keepShortPauses(segments, params.keepShortPausesUnderMs);

  // 2. Add padding around speech
  segments = addPadding(segments, params.prePadMs, params.postPadMs, totalDuration);

  // 3. Merge any overlapping segments after padding
  segments = mergeOverlapping(segments);

  // 4. Limit cut rate to avoid "machine gun" pacing
  segments = limitCutRate(segments, params.maxJumpCutRatePerMinute, totalDuration);

  // 5. Final merge pass
  segments = mergeOverlapping(segments);

  // Convert back to SpeechSegment type
  return segments.map((s, i) => ({
    id: `refined-${i}`,
    startSeconds: s.startSeconds,
    endSeconds: s.endSeconds,
    durationSeconds: s.endSeconds - s.startSeconds,
    enabled: true,
  }));
}

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate total duration of kept segments
 */
export function calculateKeptDuration(segments: SpeechSegment[]): number {
  return segments
    .filter(s => s.enabled)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
}

/**
 * Calculate number of cuts (transitions between segments)
 */
export function calculateNumberOfCuts(segments: SpeechSegment[]): number {
  const enabled = segments.filter(s => s.enabled);
  return Math.max(0, enabled.length - 1);
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
