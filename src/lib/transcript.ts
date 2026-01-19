import type { TranscriptSegment } from "@/types/clip-factory";

/**
 * Supported timestamp formats:
 * A) [00:12:34] Speaker: text...
 * B) 00:12:34 text...
 * C) 12:34 text... (assume mm:ss if no hours)
 * D) [12:34] text...
 */

// Regex patterns for timestamp detection
const TIMESTAMP_PATTERNS = [
  // [HH:MM:SS] or [MM:SS] with optional speaker
  /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(?:[^:]+:\s*)?(.+)$/,
  // HH:MM:SS or MM:SS at start of line (no brackets)
  /^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/,
  // Timestamps with dash separator: 00:12:34 - text
  /^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(.+)$/,
];

/**
 * Parse a timestamp string (HH:MM:SS or MM:SS) into total seconds
 */
export function parseTimestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);
  
  if (parts.length === 3) {
    // HH:MM:SS
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // MM:SS
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  
  return 0;
}

/**
 * Format seconds back to timestamp string
 */
export function formatSecondsToTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Try to extract timestamp and text from a single line
 */
function parseLine(line: string): { timestamp: string; text: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        timestamp: match[1],
        text: match[2].trim(),
      };
    }
  }
  
  return null;
}

/**
 * Detect number of lines that contain valid timestamps
 */
export function detectTimestampLines(text: string): number {
  const lines = text.split("\n");
  let count = 0;
  
  for (const line of lines) {
    if (parseLine(line)) {
      count++;
    }
  }
  
  return count;
}

/**
 * Parse full transcript text into ordered segments
 */
export function parseTimestampedSegments(text: string): TranscriptSegment[] {
  const lines = text.split("\n");
  const segments: TranscriptSegment[] = [];
  
  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) {
      segments.push({
        tLabel: parsed.timestamp,
        tSeconds: parseTimestampToSeconds(parsed.timestamp),
        text: parsed.text,
      });
    }
  }
  
  // Sort by timestamp (should already be sorted, but ensure)
  segments.sort((a, b) => a.tSeconds - b.tSeconds);
  
  return segments;
}

/**
 * Validate transcript has enough content
 */
export function validateTranscript(
  text: string,
  minLines: number = 30
): { valid: boolean; lineCount: number; message?: string } {
  const lineCount = detectTimestampLines(text);
  
  if (lineCount === 0) {
    return {
      valid: false,
      lineCount: 0,
      message: "No timestamps detected. Please paste a timestamped transcript.",
    };
  }
  
  if (lineCount < minLines) {
    return {
      valid: false,
      lineCount,
      message: `Only ${lineCount} timestamped lines found. Need at least ${minLines} for quality clips.`,
    };
  }
  
  return { valid: true, lineCount };
}
