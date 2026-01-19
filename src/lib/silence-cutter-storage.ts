/**
 * Silence Cutter - Storage Utilities
 * 
 * Manages localStorage history for silence cutter exports.
 * Keeps last 20 entries with file info and segments for re-export.
 */

import type { SilenceCutterHistoryEntry } from "@/types/silence-cutter";

const STORAGE_KEY = "ysk_silence_cutter_history";
const MAX_ENTRIES = 20;

/**
 * Get all history entries from localStorage
 */
export function getSilenceCutterHistory(): SilenceCutterHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SilenceCutterHistoryEntry[];
  } catch {
    return [];
  }
}

/**
 * Save a new history entry
 */
export function saveSilenceCutterEntry(
  fileName: string,
  originalDuration: number,
  finalDuration: number,
  preset: SilenceCutterHistoryEntry["preset"],
  contentType: SilenceCutterHistoryEntry["contentType"],
  keptSegments: SilenceCutterHistoryEntry["keptSegments"]
): SilenceCutterHistoryEntry {
  const entry: SilenceCutterHistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    fileName,
    originalDuration,
    finalDuration,
    timeRemoved: originalDuration - finalDuration,
    numberOfCuts: keptSegments.length > 0 ? keptSegments.length - 1 : 0,
    preset,
    contentType,
    keptSegments,
  };

  const history = getSilenceCutterHistory();
  history.unshift(entry);

  // Keep only last MAX_ENTRIES
  const trimmed = history.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full, clear old entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed.slice(0, 10)));
  }

  return entry;
}

/**
 * Delete a single history entry by ID
 */
export function deleteSilenceCutterEntry(id: string): void {
  const history = getSilenceCutterHistory();
  const filtered = history.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clear all history
 */
export function clearSilenceCutterHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get a single entry by ID
 */
export function getSilenceCutterEntryById(id: string): SilenceCutterHistoryEntry | null {
  const history = getSilenceCutterHistory();
  return history.find((e) => e.id === id) ?? null;
}
