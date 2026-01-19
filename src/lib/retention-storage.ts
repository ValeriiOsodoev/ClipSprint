import type { AnalyzeRequest, AnalyzeResponse } from "./retention-schemas";

export type RetentionHistoryItem = {
  id: string;
  timestamp: number;
  request: AnalyzeRequest;
  response: AnalyzeResponse;
};

const STORAGE_KEY = "retention-doctor-history";
const MAX_ITEMS = 20;

export function getRetentionHistory(): RetentionHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as RetentionHistoryItem[];
  } catch {
    return [];
  }
}

export function addToRetentionHistory(
  request: AnalyzeRequest,
  response: AnalyzeResponse
): RetentionHistoryItem {
  const history = getRetentionHistory();

  const item: RetentionHistoryItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    request,
    response,
  };

  const updated = [item, ...history].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return item;
}

export function deleteFromRetentionHistory(id: string): void {
  const history = getRetentionHistory();
  const updated = history.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
