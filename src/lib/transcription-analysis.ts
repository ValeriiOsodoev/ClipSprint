/**
 * Silence Cutter - Transcription-based Analysis
 * 
 * New algorithm based on speech transcription:
 * 1) Extract audio from video
 * 2) Send to Whisper API for transcription with word-level timestamps
 * 3) Identify pauses between words/segments
 * 4) Generate cut points based on pause duration thresholds
 */

import type { SpeechSegment, DetectionParams } from "@/types/silence-cutter";

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

/**
 * Convert audio blob to a File for upload
 */
export function audioBufferToWavBlob(
  samples: Float32Array,
  sampleRate: number
): Blob {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Write audio data
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset + i * 2, intSample, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Send audio to transcription API
 */
export async function transcribeAudio(
  audioBlob: Blob,
  filename: string = "audio.wav"
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, filename);

  const response = await fetch("/api/silence-cutter/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Transcription failed: ${response.status}`);
  }

  return response.json();
}

interface InternalSegment {
  startSeconds: number;
  endSeconds: number;
  words: string[];
}

/**
 * Generate speech segments from transcription
 * Uses word-level timestamps to identify speech regions
 */
export function generateSegmentsFromTranscription(
  transcription: TranscriptionResult,
  params: DetectionParams,
  videoDuration: number
): SpeechSegment[] {
  // Collect all words with timestamps
  const allWords: TranscriptionWord[] = [];
  
  for (const segment of transcription.segments) {
    if (segment.words && segment.words.length > 0) {
      allWords.push(...segment.words);
    } else {
      // If no word-level timestamps, use segment timestamps
      allWords.push({
        word: segment.text,
        start: segment.start,
        end: segment.end,
      });
    }
  }

  if (allWords.length === 0) {
    // No speech detected, return empty
    return [];
  }

  // Sort words by start time
  allWords.sort((a, b) => a.start - b.start);

  // Group words into speech segments based on pause thresholds
  const minimumSilenceS = params.minimumSilenceMs / 1000;
  const paddingS = params.prePadMs / 1000; // Use prePadMs as general padding
  const mergeGapS = params.mergeGapMs / 1000;

  const internalSegments: InternalSegment[] = [];
  let currentSegment: InternalSegment | null = null;

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i];
    
    if (!currentSegment) {
      // Start new segment
      currentSegment = {
        startSeconds: Math.max(0, word.start - paddingS),
        endSeconds: word.end + paddingS,
        words: [word.word],
      };
    } else {
      // Check gap to previous word
      const gap = word.start - (currentSegment.endSeconds - paddingS);
      
      if (gap < minimumSilenceS || gap < mergeGapS) {
        // Extend current segment
        currentSegment.endSeconds = word.end + paddingS;
        currentSegment.words.push(word.word);
      } else {
        // Gap is long enough - save current segment and start new one
        internalSegments.push(currentSegment);
        
        currentSegment = {
          startSeconds: Math.max(0, word.start - paddingS),
          endSeconds: word.end + paddingS,
          words: [word.word],
        };
      }
    }
  }

  // Don't forget the last segment
  if (currentSegment) {
    internalSegments.push(currentSegment);
  }

  // Convert to SpeechSegment format
  const segments: SpeechSegment[] = internalSegments.map((seg, idx) => {
    const label = seg.words.slice(0, 5).join(" ") + (seg.words.length > 5 ? "..." : "");
    const endSeconds = Math.min(seg.endSeconds, videoDuration);
    return {
      id: String(idx),
      startSeconds: seg.startSeconds,
      endSeconds: endSeconds,
      durationSeconds: endSeconds - seg.startSeconds,
      label,
      enabled: true,
    };
  });

  // Apply keepShortPausesUnderMs: merge segments with very short gaps
  const mergedSegments = mergeShortPauses(segments, params.keepShortPausesUnderMs);

  return mergedSegments;
}

/**
 * Merge segments that have very short pauses between them
 * This preserves natural breathing pauses
 */
function mergeShortPauses(
  segments: SpeechSegment[],
  keepShortPausesUnderMs: number
): SpeechSegment[] {
  if (segments.length <= 1) return segments;

  const merged: SpeechSegment[] = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const next = segments[i];
    const gapMs = (next.startSeconds - current.endSeconds) * 1000;

    if (gapMs <= keepShortPausesUnderMs) {
      // Merge: extend current to include the gap and next segment
      current.endSeconds = next.endSeconds;
      current.durationSeconds = current.endSeconds - current.startSeconds;
      if (current.label) {
        current.label = current.label.split("...")[0] + "...";
      }
    } else {
      // Gap is long enough, save current and move to next
      merged.push(current);
      current = { ...next, id: String(merged.length) };
    }
  }

  merged.push(current);

  // Re-number IDs
  return merged.map((seg, idx) => ({ ...seg, id: String(idx) }));
}

/**
 * Calculate pause statistics from transcription
 * Used for LLM parameter tuning
 */
export function calculatePauseStats(transcription: TranscriptionResult): {
  totalPauses: number;
  avgPauseMs: number;
  maxPauseMs: number;
  minPauseMs: number;
  pauseDistribution: { short: number; medium: number; long: number };
} {
  const pauses: number[] = [];
  
  const allWords: TranscriptionWord[] = [];
  for (const segment of transcription.segments) {
    if (segment.words) {
      allWords.push(...segment.words);
    }
  }

  allWords.sort((a, b) => a.start - b.start);

  for (let i = 1; i < allWords.length; i++) {
    const gap = (allWords[i].start - allWords[i - 1].end) * 1000;
    if (gap > 50) { // Ignore tiny gaps (< 50ms)
      pauses.push(gap);
    }
  }

  if (pauses.length === 0) {
    return {
      totalPauses: 0,
      avgPauseMs: 0,
      maxPauseMs: 0,
      minPauseMs: 0,
      pauseDistribution: { short: 0, medium: 0, long: 0 },
    };
  }

  const short = pauses.filter(p => p < 300).length;
  const medium = pauses.filter(p => p >= 300 && p < 800).length;
  const long = pauses.filter(p => p >= 800).length;

  return {
    totalPauses: pauses.length,
    avgPauseMs: Math.round(pauses.reduce((a, b) => a + b, 0) / pauses.length),
    maxPauseMs: Math.round(Math.max(...pauses)),
    minPauseMs: Math.round(Math.min(...pauses)),
    pauseDistribution: { short, medium, long },
  };
}
