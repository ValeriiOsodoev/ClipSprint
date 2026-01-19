"use client";

import type { SilenceCutterHistoryEntry } from "@/types/silence-cutter";
import { formatTime } from "@/lib/audio-analysis";

type SilenceCutterHistoryPanelProps = {
  history: SilenceCutterHistoryEntry[];
  onOpen: (entry: SilenceCutterHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  texts: {
    title: string;
    empty: string;
    clearAll: string;
    confirmClear: string;
    open: string;
    delete: string;
    timeRemoved: string;
    cuts: string;
  };
};

export default function SilenceCutterHistoryPanel({
  history,
  onOpen,
  onDelete,
  onClear,
  texts,
}: SilenceCutterHistoryPanelProps) {
  const handleClear = () => {
    if (window.confirm(texts.confirmClear)) {
      onClear();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateFileName = (name: string, maxLength: number = 25) => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop() || "";
    const base = name.slice(0, name.length - ext.length - 1);
    const truncated = base.slice(0, maxLength - ext.length - 4);
    return `${truncated}...${ext}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {texts.title}
        </h3>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            {texts.clearAll}
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {history.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            {texts.empty}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {history.map((entry) => (
              <li key={entry.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {truncateFileName(entry.fileName)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(entry.timestamp)}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-red-500 dark:text-red-400">
                        -{formatTime(entry.timeRemoved)} {texts.timeRemoved}
                      </span>
                      <span>
                        {entry.numberOfCuts} {texts.cuts}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onOpen(entry)}
                      className="p-1.5 rounded text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      title={texts.open}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title={texts.delete}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
