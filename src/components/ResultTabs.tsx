"use client";

import { useState, useMemo } from "react";
import type { GenerateResponse } from "@/types";
import CopyButton from "./CopyButton";

type ResultTabsProps = {
  data: GenerateResponse;
};

type TabId = "titles" | "hooks" | "outline" | "intro-cta";

const TABS: { id: TabId; label: string }[] = [
  { id: "titles", label: "Titles" },
  { id: "hooks", label: "Hooks" },
  { id: "outline", label: "Outline" },
  { id: "intro-cta", label: "Intro + CTA" },
];

export default function ResultTabs({ data }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("titles");

  const titlesText = useMemo(() => {
    return data.titles.map((t) => `[${t.label}] ${t.text}`).join("\n\n");
  }, [data.titles]);

  const hooksText = useMemo(() => {
    return data.hooks.map((h) => `[${h.seconds}s] ${h.text}`).join("\n\n");
  }, [data.hooks]);

  const outlineText = useMemo(() => {
    return data.outline
      .map((o) => `${o.t} — ${o.segment}\n   ${o.notes}`)
      .join("\n\n");
  }, [data.outline]);

  const introCTAText = useMemo(() => {
    return `INTRO:\n${data.intro.text}\n\nCTA:\n${data.cta.text}`;
  }, [data.intro.text, data.cta.text]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Titles Tab */}
        {activeTab === "titles" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                15 Video Titles
              </h3>
              <CopyButton text={titlesText} />
            </div>
            <div className="space-y-3">
              {data.titles.map((title, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded mr-2 ${
                      title.label === "SEO"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : title.label === "click"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {title.label}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {title.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hooks Tab */}
        {activeTab === "hooks" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                10 Hook Openings
              </h3>
              <CopyButton text={hooksText} />
            </div>
            <div className="space-y-3">
              {data.hooks.map((hook, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded mr-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {hook.seconds}s
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {hook.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outline Tab */}
        {activeTab === "outline" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Video Outline
              </h3>
              <CopyButton text={outlineText} />
            </div>
            <div className="space-y-4">
              {data.outline.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-block px-2 py-1 text-sm font-mono font-medium rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {item.t}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.segment}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {item.notes}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intro + CTA Tab */}
        {activeTab === "intro-cta" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Intro &amp; Call to Action
              </h3>
              <CopyButton text={introCTAText} />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Intro
                  </h4>
                  <CopyButton text={data.intro.text} />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {data.intro.text}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Call to Action
                  </h4>
                  <CopyButton text={data.cta.text} />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {data.cta.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
