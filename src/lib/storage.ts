import type { GenerateRequest, GenerateResponse } from "./schemas";

export type HistoryItem = {
  id: string;
  timestamp: number;
  request: GenerateRequest;
  response: GenerateResponse;
};

const STORAGE_KEY = "youtube-script-kit-history";
const MAX_ITEMS = 20;

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

export function addToHistory(
  request: GenerateRequest,
  response: GenerateResponse
): HistoryItem {
  const history = getHistory();

  const item: HistoryItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    request,
    response,
  };

  const updated = [item, ...history].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return item;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getHistoryItem(id: string): HistoryItem | undefined {
  const history = getHistory();
  return history.find((item) => item.id === id);
}
