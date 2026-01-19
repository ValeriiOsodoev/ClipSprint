import type { Clip } from "@/types/clip-factory";

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
 * Generate a CMX 3600 EDL file content
 */
export function generateEdl(
  clips: Clip[],
  fps: number = 30,
  title: string = "Clip Factory Lite"
): string {
  const lines: string[] = [];
  
  // EDL header
  lines.push(`TITLE: ${title}`);
  lines.push(`FCM: NON-DROP FRAME`);
  lines.push("");
  
  // Track running record timecode
  let recordIn = 0;
  
  clips.forEach((clip, index) => {
    const eventNum = (index + 1).toString().padStart(3, "0");
    
    // Source in/out (from transcript timestamps)
    const sourceIn = secondsToTimecode(clip.startSeconds, fps);
    const sourceOut = secondsToTimecode(clip.endSeconds, fps);
    
    // Record in/out (sequential on timeline)
    const recordInTC = secondsToTimecode(recordIn, fps);
    const recordOutTC = secondsToTimecode(recordIn + clip.durationSeconds, fps);
    
    // EDL event line format:
    // EVENT# REEL TRACK TRANS SOURCE_IN SOURCE_OUT RECORD_IN RECORD_OUT
    lines.push(`${eventNum}  AX       V     C        ${sourceIn} ${sourceOut} ${recordInTC} ${recordOutTC}`);
    
    // Optional: Add clip title as comment
    lines.push(`* FROM CLIP NAME: ${clip.clipTitle}`);
    lines.push(`* COLD OPEN: ${clip.coldOpenLine.substring(0, 60)}...`);
    lines.push("");
    
    // Update record position for next clip
    recordIn += clip.durationSeconds;
  });
  
  return lines.join("\n");
}

/**
 * Generate a simple JSON export
 */
export function generateClipsJson(clips: Clip[]): string {
  return JSON.stringify({ clips, exportedAt: new Date().toISOString() }, null, 2);
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
