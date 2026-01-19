import type { ClipFactoryHistoryEntry, ClipFactoryRequest, ClipFactoryResponse } from "@/types/clip-factory";

const STORAGE_KEY = "ysk_clip_factory_history";
const MAX_ENTRIES = 20;

export function getClipFactoryHistory(): ClipFactoryHistoryEntry[] {
  if (typeof window === "undefined") return [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClipFactoryHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveClipFactoryResult(
  request: ClipFactoryRequest,
  response: ClipFactoryResponse
): ClipFactoryHistoryEntry {
  const entry: ClipFactoryHistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    request: {
      language: request.language,
      targetPlatform: request.targetPlatform,
      minClipSeconds: request.minClipSeconds,
      maxClipSeconds: request.maxClipSeconds,
      style: request.style,
      allowProfanity: request.allowProfanity,
      contentType: request.contentType,
      segmentCount: request.segments.length,
    },
    response,
  };
  
  const history = getClipFactoryHistory();
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

export function deleteClipFactoryEntry(id: string): void {
  const history = getClipFactoryHistory();
  const filtered = history.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearClipFactoryHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
