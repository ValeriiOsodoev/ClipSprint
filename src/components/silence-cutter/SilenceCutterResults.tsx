"use client";

import type { SpeechSegment, ProcessingState } from "@/types/silence-cutter";
import { formatTime } from "@/lib/audio-analysis";
import WaveformDisplay from "./WaveformDisplay";

type SilenceCutterResultsProps = {
  segments: SpeechSegment[];
  onToggleSegment: (id: string) => void;
  originalDuration: number;
  processingState: ProcessingState;
  onExportVideo: () => void;
  onDownloadJson: () => void;
  onDownloadEdl: () => void;
  isExporting: boolean;
  ffmpegReady: boolean;
  audioSamples: Float32Array | null;
  audioSampleRate: number;
  texts: {
    statsTitle: string;
    originalDuration: string;
    newDuration: string;
    timeRemoved: string;
    numberOfCuts: string;
    segmentsTitle: string;
    segmentStart: string;
    segmentEnd: string;
    segmentDuration: string;
    segmentEnabled: string;
    noSegments: string;
    exportVideoButton: string;
    exportingButton: string;
    downloadJsonButton: string;
    downloadEdlButton: string;
    processingStage: string;
    ffmpegNotReady?: string;
    waveformBefore?: string;
    waveformAfter?: string;
  };
};

export default function SilenceCutterResults({
  segments,
  onToggleSegment,
  originalDuration,
  processingState,
  onExportVideo,
  onDownloadJson,
  onDownloadEdl,
  isExporting,
  ffmpegReady,
  audioSamples,
  audioSampleRate,
  texts,
}: SilenceCutterResultsProps) {
  const enabledSegments = segments.filter((s) => s.enabled);
  const newDuration = enabledSegments.reduce((sum, s) => sum + s.durationSeconds, 0);
  const timeRemoved = originalDuration - newDuration;
  const numberOfCuts = Math.max(0, enabledSegments.length - 1);
  const percentRemoved = originalDuration > 0 ? (timeRemoved / originalDuration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Processing Progress */}
      {processingState.stage !== "idle" && processingState.stage !== "complete" && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-orange-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-orange-800 dark:text-orange-200">
                {processingState.message}
              </p>
              <div className="mt-2 w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingState.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {segments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {texts.statsTitle}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(originalDuration)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {texts.originalDuration}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatTime(newDuration)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {texts.newDuration}
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{formatTime(timeRemoved)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {texts.timeRemoved} ({percentRemoved.toFixed(1)}%)
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {numberOfCuts}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {texts.numberOfCuts}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Waveform Visualization */}
      {audioSamples && audioSamples.length > 0 && segments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {texts.waveformBefore || "Audio Waveform"}
          </h3>
          
          {/* Before - Full waveform with cut regions highlighted */}
          <WaveformDisplay
            samples={audioSamples}
            sampleRate={audioSampleRate}
            duration={originalDuration}
            segments={segments.map(s => ({
              startMs: Math.round(s.startSeconds * 1000),
              endMs: Math.round(s.endSeconds * 1000),
              enabled: s.enabled,
            }))}
            height={120}
            label={texts.waveformBefore || "Original (red = will be cut)"}
          />
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-orange-500 rounded" />
              <span>Speech (kept)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-red-500/30 rounded" />
              <span>Silence (cut)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gray-500 rounded" />
              <span>Disabled segment</span>
            </div>
          </div>
        </div>
      )}

      {/* Segments List */}
      {segments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {texts.segmentsTitle}
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  segment.enabled
                    ? "bg-gray-50 dark:bg-gray-900"
                    : "bg-red-50 dark:bg-red-900/20 opacity-60"
                }`}
              >
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                  #{index + 1}
                </span>
                <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {texts.segmentStart}:{" "}
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {formatTime(segment.startSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {texts.segmentEnd}:{" "}
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {formatTime(segment.endSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {texts.segmentDuration}:{" "}
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {segment.durationSeconds.toFixed(1)}s
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSegment(segment.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    segment.enabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  }`}
                >
                  {segment.enabled ? "✓" : "✕"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Buttons */}
      {segments.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onExportVideo}
            disabled={isExporting || enabledSegments.length === 0 || !ffmpegReady}
            className="flex-1 min-w-[200px] py-3 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
            title={!ffmpegReady ? (texts.ffmpegNotReady || "Video processor not ready") : undefined}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {texts.exportingButton}
              </>
            ) : !ffmpegReady ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {texts.ffmpegNotReady || "Loading..."}
              </>
            ) : (
              <>
                <span>🎬</span>
                {texts.exportVideoButton}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDownloadJson}
            disabled={enabledSegments.length === 0}
            className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium transition-colors flex items-center gap-2"
          >
            <span>📄</span>
            {texts.downloadJsonButton}
          </button>
          <button
            type="button"
            onClick={onDownloadEdl}
            disabled={enabledSegments.length === 0}
            className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium transition-colors flex items-center gap-2"
          >
            <span>🎞️</span>
            {texts.downloadEdlButton}
          </button>
        </div>
      )}

      {/* No segments message */}
      {segments.length === 0 && processingState.stage === "complete" && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{texts.noSegments}</p>
        </div>
      )}
    </div>
  );
}
