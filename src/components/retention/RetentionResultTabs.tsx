"use client";

import { useState, useMemo } from "react";
import type { AnalyzeResponse } from "@/types/retention";
import CopyButton from "../CopyButton";

type RetentionResultTabsProps = {
  data: AnalyzeResponse;
};

type TabId = "dropoff" | "tight" | "interrupts" | "broll";

const TABS: { id: TabId; label: string }[] = [
  { id: "dropoff", label: "Drop-off Map" },
  { id: "tight", label: "Tight Script" },
  { id: "interrupts", label: "Pattern Interrupts" },
  { id: "broll", label: "B-roll / Visuals" },
];

const ISSUE_TAG_LABELS: Record<string, { label: string; color: string }> = {
  no_promise: {
    label: "No Promise",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  no_conflict: {
    label: "No Conflict",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  too_long: {
    label: "Too Long",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  no_example: {
    label: "No Example",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  low_novelty: {
    label: "Low Novelty",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
};

const INTERRUPT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  question: {
    label: "❓ Question",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  scene_change: {
    label: "🎬 Scene Change",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  mini_story: {
    label: "📖 Mini Story",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  on_screen_text: {
    label: "📝 On-Screen Text",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  visual_gag: {
    label: "😄 Visual Gag",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
};

export default function RetentionResultTabs({ data }: RetentionResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("dropoff");

  const dropoffText = useMemo(() => {
    return data.dropoffMap
      .map(
        (d) =>
          `[${d.id}] Issues: ${d.issueTags.join(", ")}\nWhy: ${d.why}\nRewrite:\n${d.rewrite}`
      )
      .join("\n\n---\n\n");
  }, [data.dropoffMap]);

  const interruptsText = useMemo(() => {
    return data.patternInterrupts
      .map((p) => `[${p.t}] ${p.type}\nLine: ${p.line}\nNotes: ${p.notes}`)
      .join("\n\n");
  }, [data.patternInterrupts]);

  const brollText = useMemo(() => {
    return data.broll
      .map(
        (b) =>
          `[${b.t}] ${b.visual}${b.onScreenText ? `\nOn-screen: "${b.onScreenText}"` : ""}`
      )
      .join("\n\n");
  }, [data.broll]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 -mb-px"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Drop-off Map Tab */}
        {activeTab === "dropoff" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Drop-off Map ({data.dropoffMap.length} issues)
              </h3>
              <CopyButton text={dropoffText} />
            </div>
            <div className="space-y-4">
              {data.dropoffMap.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-red-400"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-mono font-medium text-gray-500 dark:text-gray-400">
                      {item.id}
                    </span>
                    {item.issueTags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          ISSUE_TAG_LABELS[tag]?.color || "bg-gray-100"
                        }`}
                      >
                        {ISSUE_TAG_LABELS[tag]?.label || tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="font-medium">Why:</span> {item.why}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase">
                        Suggested Rewrite
                      </span>
                      <CopyButton text={item.rewrite} />
                    </div>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm">
                      {item.rewrite}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tight Script Tab */}
        {activeTab === "tight" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Tight Script (No Filler)
              </h3>
              <CopyButton text={data.tightScript.text} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {data.tightScript.text}
              </p>
            </div>
          </div>
        )}

        {/* Pattern Interrupts Tab */}
        {activeTab === "interrupts" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Pattern Interrupts ({data.patternInterrupts.length})
              </h3>
              <CopyButton text={interruptsText} />
            </div>
            <div className="space-y-3">
              {data.patternInterrupts.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-block px-2 py-1 text-sm font-mono font-medium rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {item.t}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            INTERRUPT_TYPE_LABELS[item.type]?.color ||
                            "bg-gray-100"
                          }`}
                        >
                          {INTERRUPT_TYPE_LABELS[item.type]?.label || item.type}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">
                        &ldquo;{item.line}&rdquo;
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* B-roll Tab */}
        {activeTab === "broll" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                B-roll / Visual Inserts ({data.broll.length})
              </h3>
              <CopyButton text={brollText} />
            </div>
            <div className="space-y-3">
              {data.broll.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-block px-2 py-1 text-sm font-mono font-medium rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                      {item.t}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">
                        {item.visual}
                      </p>
                      {item.onScreenText && (
                        <p className="mt-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            On-screen text:{" "}
                          </span>
                          <span className="font-medium text-yellow-600 dark:text-yellow-400">
                            &ldquo;{item.onScreenText}&rdquo;
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
