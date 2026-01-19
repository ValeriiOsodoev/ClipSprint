"use client";

import { useState } from "react";
import type { Clip, ClipFactoryResponse } from "@/types/clip-factory";
import { generateEdl, generateClipsJson, downloadFile } from "@/lib/edl";
import CopyButton from "@/components/CopyButton";

type Props = {
  data: ClipFactoryResponse;
  texts: {
    results: string;
    clipNumber: string;
    duration: string;
    seconds: string;
    coldOpen: string;
    subtitles: string;
    whyItWorks: string;
    copyTitle: string;
    copyColdOpen: string;
    copySubtitles: string;
    downloadEdl: string;
    downloadJson: string;
    profanityWarning: string;
  };
};

function ClipCard({ clip, index, texts }: { clip: Clip; index: number; texts: Props["texts"] }) {
  const [expanded, setExpanded] = useState(false);
  
  const subtitlesText = clip.subtitles
    .map((s) => [s.line1, s.line2].filter(Boolean).join("\n"))
    .join("\n\n");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {texts.clipNumber.replace("{n}", String(index + 1))}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {clip.start} → {clip.end}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({clip.durationSeconds}{texts.seconds})
              </span>
              {clip.containsProfanity && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  ⚠️
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {clip.clipTitle}
            </h3>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {/* Cold Open */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                {texts.coldOpen}
              </span>
              <CopyButton text={clip.coldOpenLine} label={texts.copyColdOpen} />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 italic">
              &ldquo;{clip.coldOpenLine}&rdquo;
            </p>
          </div>

          {/* Subtitles */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                {texts.subtitles}
              </span>
              <CopyButton text={subtitlesText} label={texts.copySubtitles} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2">
              {clip.subtitles.map((sub, i) => (
                <div key={i} className="text-sm font-mono">
                  <span className="text-gray-400 text-xs mr-2">
                    [{sub.startOffsetSeconds}s-{sub.endOffsetSeconds}s]
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{sub.line1}</span>
                  {sub.line2 && (
                    <>
                      <br />
                      <span className="text-gray-400 text-xs mr-2 invisible">[0s]</span>
                      <span className="text-gray-700 dark:text-gray-300">{sub.line2}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Why It Works */}
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">
              {texts.whyItWorks}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 {clip.whyThisClipWorks}
            </p>
          </div>

          {/* Copy Title Button */}
          <div className="flex gap-2 pt-2">
            <CopyButton text={clip.clipTitle} label={texts.copyTitle} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClipFactoryResults({ data, texts }: Props) {
  const handleDownloadEdl = () => {
    const edl = generateEdl(data.clips);
    downloadFile(edl, "clips.edl", "text/plain");
  };

  const handleDownloadJson = () => {
    const json = generateClipsJson(data.clips);
    downloadFile(json, "clips.json", "application/json");
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {texts.results} ({data.clips.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadEdl}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
          >
            📥 {texts.downloadEdl}
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            📄 {texts.downloadJson}
          </button>
        </div>
      </div>

      {/* Clips List */}
      <div className="space-y-4">
        {data.clips.map((clip, index) => (
          <ClipCard key={clip.id} clip={clip} index={index} texts={texts} />
        ))}
      </div>
    </div>
  );
}
