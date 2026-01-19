"use client";

import { useState, useRef, useCallback } from "react";
import type { CutPreset, ContentType, UserSettings } from "@/types/silence-cutter";

type SilenceCutterFormProps = {
  onFileSelect: (file: File) => void;
  onAnalyze: (settings: UserSettings) => void;
  isAnalyzing: boolean;
  isVideoLoaded: boolean;
  texts: {
    uploadTitle: string;
    uploadDescription: string;
    uploadButton: string;
    dropHere: string;
    supportedFormats: string;
    fileSizeWarning: string;
    presetLabel: string;
    presetGentle: string;
    presetNormal: string;
    presetAggressive: string;
    contentTypeLabel: string;
    contentTalkingHead: string;
    contentTutorial: string;
    contentPodcast: string;
    contentScreenRecording: string;
    naturalnessLabel: string;
    naturalnessLow: string;
    naturalnessHigh: string;
    minSilenceLabel: string;
    analyzeButton: string;
    analyzingButton: string;
  };
};

export default function SilenceCutterForm({
  onFileSelect,
  onAnalyze,
  isAnalyzing,
  isVideoLoaded,
  texts,
}: SilenceCutterFormProps) {
  const [preset, setPreset] = useState<CutPreset>("normal");
  const [contentType, setContentType] = useState<ContentType>("talking_head");
  const [naturalness, setNaturalness] = useState(50);
  const [minSilenceToRemove, setMinSilenceToRemove] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (file) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|webm|mkv|avi)$/i))) {
        handleFileChange(file);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAnalyze = () => {
    onAnalyze({
      preset,
      contentType,
      naturalness,
      minSilenceToRemove,
      precisionMode: false, // MVP: disabled
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isLargeFile = selectedFile && selectedFile.size > 500 * 1024 * 1024; // > 500MB

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
            : selectedFile
            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm,.mkv,.avi"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="text-4xl">
            {selectedFile ? "✅" : isDragging ? "📥" : "🎬"}
          </div>

          {selectedFile ? (
            <>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
              {isLargeFile && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ {texts.fileSizeWarning}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-medium text-gray-900 dark:text-white">
                {isDragging ? texts.dropHere : texts.uploadTitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {texts.uploadDescription}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
              >
                {texts.uploadButton}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {texts.supportedFormats}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {texts.presetLabel}
          </label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as CutPreset)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="gentle">{texts.presetGentle}</option>
            <option value="normal">{texts.presetNormal}</option>
            <option value="aggressive">{texts.presetAggressive}</option>
          </select>
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {texts.contentTypeLabel}
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="talking_head">{texts.contentTalkingHead}</option>
            <option value="tutorial">{texts.contentTutorial}</option>
            <option value="podcast">{texts.contentPodcast}</option>
            <option value="screen_recording">{texts.contentScreenRecording}</option>
          </select>
        </div>
      </div>

      {/* Naturalness Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {texts.naturalnessLabel}
        </label>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
            {texts.naturalnessLow}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={naturalness}
            onChange={(e) => setNaturalness(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 text-right">
            {texts.naturalnessHigh}
          </span>
        </div>
      </div>

      {/* Minimum Silence */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {texts.minSilenceLabel}
        </label>
        <div className="flex gap-2">
          {[300, 500, 800].map((ms) => (
            <button
              key={ms}
              type="button"
              onClick={() => setMinSilenceToRemove(ms)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                minSilenceToRemove === ms
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {ms / 1000}s
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!isVideoLoaded || isAnalyzing}
        className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
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
            {texts.analyzingButton}
          </>
        ) : (
          <>
            <span>🔍</span>
            {texts.analyzeButton}
          </>
        )}
      </button>
    </div>
  );
}
