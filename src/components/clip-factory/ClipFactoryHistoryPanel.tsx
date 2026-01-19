"use client";

import { useState, useEffect } from "react";
import type { ClipFactoryHistoryEntry, ClipFactoryResponse } from "@/types/clip-factory";
import { getClipFactoryHistory, deleteClipFactoryEntry, clearClipFactoryHistory } from "@/lib/clip-factory-storage";

type Props = {
  onSelect: (response: ClipFactoryResponse) => void;
  texts: {
    history: string;
    noHistory: string;
    clearAll: string;
    confirmClear: string;
    segments: string;
    clips: string;
    open: string;
    delete: string;
  };
  refreshTrigger?: number;
};

export default function ClipFactoryHistoryPanel({ onSelect, texts, refreshTrigger }: Props) {
  const [entries, setEntries] = useState<ClipFactoryHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getClipFactoryHistory());
  }, [refreshTrigger]);

  const handleDelete = (id: string) => {
    deleteClipFactoryEntry(id);
    setEntries(getClipFactoryHistory());
  };

  const handleClearAll = () => {
    if (confirm(texts.confirmClear)) {
      clearClipFactoryHistory();
      setEntries([]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const platformLabels: Record<string, string> = {
    shorts: "YT Shorts",
    reels: "Reels",
    tiktok: "TikTok",
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {texts.history}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{texts.noHistory}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {texts.history} ({entries.length})
        </h3>
        <button
          onClick={handleClearAll}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          {texts.clearAll}
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {platformLabels[entry.request.targetPlatform]}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.request.segmentCount} {texts.segments}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(entry.timestamp)} • {entry.response.clips.length} {texts.clips}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onSelect(entry.response)}
                  className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  {texts.open}
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  {texts.delete}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
