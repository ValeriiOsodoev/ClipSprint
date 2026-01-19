"use client";

import { useState, useEffect, useCallback } from "react";
import { getHistory, deleteFromHistory, type HistoryItem } from "@/lib/storage";
import type { GenerateRequest, GenerateResponse } from "@/types";

type HistoryPanelProps = {
  onSelect: (request: GenerateRequest, response: GenerateResponse) => void;
  onDelete: () => void;
};

export default function HistoryPanel({ onSelect, onDelete }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSelect = useCallback(
    (item: HistoryItem) => {
      onSelect(item.request, item.response);
    },
    [onSelect]
  );

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteFromHistory(id);
      setHistory(getHistory());
      onDelete();
    },
    [onDelete]
  );

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          History ({history.length})
        </h2>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {item.request.topic}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{item.request.niche}</span>
                    <span>•</span>
                    <span>{item.request.durationMinutes}min</span>
                    <span>•</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
          ))}
        </div>
      )}
    </div>
  );
}
