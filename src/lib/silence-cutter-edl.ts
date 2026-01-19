/**
 * Silence Cutter - EDL Export Utilities
 * 
 * Generates EDL (Edit Decision List) files in CMX 3600 format
 * for import into professional video editors like Premiere Pro and DaVinci Resolve.
 */

import type { SpeechSegment, CutListJson } from "@/types/silence-cutter";

/**
 * Convert seconds to SMPTE timecode (HH:MM:SS:FF) at given FPS
 */
function secondsToTimecode(totalSeconds: number, fps: number = 30): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = Math.floor((totalSeconds % 1) * fps);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
    frames.toString().padStart(2, "0"),
  ].join(":");
}

/**
 * Generate a CMX 3600 EDL file content from speech segments
 */
export function generateSilenceCutterEdl(
  segments: SpeechSegment[],
  fps: number = 30,
  title: string = "Silence Cutter Export"
): string {
  const enabledSegments = segments.filter(s => s.enabled);
  const lines: string[] = [];

  // EDL header
  lines.push(`TITLE: ${title}`);
  lines.push(`FCM: NON-DROP FRAME`);
  lines.push("");

  // Track running record timecode (where each segment appears in the output timeline)
  let recordIn = 0;

  enabledSegments.forEach((segment, index) => {
    const eventNum = (index + 1).toString().padStart(3, "0");

    // Source in/out (from original video timestamps)
    const sourceIn = secondsToTimecode(segment.startSeconds, fps);
    const sourceOut = secondsToTimecode(segment.endSeconds, fps);

    // Record in/out (sequential on output timeline)
    const recordInTC = secondsToTimecode(recordIn, fps);
    const recordOutTC = secondsToTimecode(recordIn + segment.durationSeconds, fps);

    // EDL event line format:
    // EVENT# REEL TRACK TRANS SOURCE_IN SOURCE_OUT RECORD_IN RECORD_OUT
    // AX = auxiliary reel (generic)
    // V = video track
    // C = cut transition
    lines.push(`${eventNum}  AX       V     C        ${sourceIn} ${sourceOut} ${recordInTC} ${recordOutTC}`);

    // Also include audio track
    lines.push(`${eventNum}  AX       A     C        ${sourceIn} ${sourceOut} ${recordInTC} ${recordOutTC}`);

    // Add comment with segment info
    lines.push(`* SEGMENT ${index + 1}: ${segment.startSeconds.toFixed(2)}s - ${segment.endSeconds.toFixed(2)}s`);
    lines.push("");

    // Update record position for next segment
    recordIn += segment.durationSeconds;
  });

  return lines.join("\n");
}

/**
 * Generate cut list JSON for export
 */
export function generateCutListJson(
  segments: SpeechSegment[],
  sourceFileName: string,
  originalDuration: number,
  fps: number = 30
): CutListJson {
  const enabledSegments = segments.filter(s => s.enabled);
  const finalDuration = enabledSegments.reduce((sum, s) => sum + s.durationSeconds, 0);

  return {
    sourceFileName,
    fpsAssumed: fps,
    totalDurationOriginal: originalDuration,
    totalDurationAfterCuts: finalDuration,
    totalTimeRemoved: originalDuration - finalDuration,
    numberOfCuts: Math.max(0, enabledSegments.length - 1),
    keptSegments: enabledSegments.map(s => ({
      startSeconds: s.startSeconds,
      endSeconds: s.endSeconds,
    })),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download EDL file
 */
export function downloadEdl(
  segments: SpeechSegment[],
  sourceFileName: string,
  fps: number = 30
): void {
  const baseName = sourceFileName.replace(/\.[^/.]+$/, "");
  const edlContent = generateSilenceCutterEdl(segments, fps, `${baseName} - Silence Removed`);
  downloadFile(edlContent, `${baseName}_silence_removed.edl`, "text/plain");
}

/**
 * Download JSON cut list
 */
export function downloadCutListJson(
  segments: SpeechSegment[],
  sourceFileName: string,
  originalDuration: number,
  fps: number = 30
): void {
  const baseName = sourceFileName.replace(/\.[^/.]+$/, "");
  const json = generateCutListJson(segments, sourceFileName, originalDuration, fps);
  downloadFile(JSON.stringify(json, null, 2), `${baseName}_cuts.json`, "application/json");
}
