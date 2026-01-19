"use client";

import { useState, useRef, useEffect } from "react";
import type { Lang } from "@/lib/i18n";
import { detectTimestampLines, parseTimestampedSegments, validateTranscript } from "@/lib/transcript";

type FormData = {
  targetPlatform: "shorts" | "reels" | "tiktok";
  minClipSeconds: 15 | 20 | 30;
  maxClipSeconds: 30 | 45 | 60;
  style: "calm" | "energetic";
  allowProfanity: boolean;
  contentType: "podcast" | "tutorial" | "gaming" | "interview" | "commentary" | "";
};

type Props = {
  lang: Lang;
  texts: {
    title: string;
    pasteTranscript: string;
    uploadFile: string;
    platform: string;
    minDuration: string;
    maxDuration: string;
    style: string;
    styleCalm: string;
    styleEnergetic: string;
    allowProfanity: string;
    contentType: string;
    contentTypes: {
      none: string;
      podcast: string;
      tutorial: string;
      gaming: string;
      interview: string;
      commentary: string;
    };
    analyze: string;
    analyzing: string;
    timestampCount: string;
    noTimestamps: string;
    notEnoughLines: string;
    seconds: string;
  };
  onSubmit: (
    segments: { t: string; tSeconds: number; text: string }[],
    options: FormData & { language: Lang }
  ) => void;
  isLoading: boolean;
};

export default function ClipFactoryForm({ lang, texts, onSubmit, isLoading }: Props) {
  const [transcript, setTranscript] = useState("");
  const [timestampCount, setTimestampCount] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    targetPlatform: "shorts",
    minClipSeconds: 20,
    maxClipSeconds: 60,
    style: "energetic",
    allowProfanity: false,
    contentType: "",
  });

  // Update timestamp count when transcript changes
  useEffect(() => {
    const count = detectTimestampLines(transcript);
    setTimestampCount(count);
    
    if (transcript.trim() && count === 0) {
      setValidationError(texts.noTimestamps);
    } else if (transcript.trim() && count < 30) {
      setValidationError(texts.notEnoughLines.replace("{count}", String(count)));
    } else {
      setValidationError(null);
    }
  }, [transcript, texts.noTimestamps, texts.notEnoughLines]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".txt")) {
      alert("Only .txt files are supported");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTranscript(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateTranscript(transcript);
    if (!validation.valid) {
      setValidationError(validation.message || texts.noTimestamps);
      return;
    }
    
    const segments = parseTimestampedSegments(transcript).map((s) => ({
      t: s.tLabel,
      tSeconds: s.tSeconds,
      text: s.text,
    }));
    
    onSubmit(segments, { ...formData, language: lang });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transcript Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {texts.pasteTranscript}
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          placeholder="[00:00:00] Speaker: Hello everyone..."
        />
        
        {/* Timestamp count indicator */}
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-sm ${timestampCount >= 30 ? "text-green-600 dark:text-green-400" : timestampCount > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-500"}`}>
            {texts.timestampCount.replace("{count}", String(timestampCount))}
          </span>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {texts.uploadFile}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        
        {validationError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{validationError}</p>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {texts.platform}
          </label>
          <select
            value={formData.targetPlatform}
            onChange={(e) => setFormData({ ...formData, targetPlatform: e.target.value as FormData["targetPlatform"] })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="shorts">YouTube Shorts</option>
            <option value="reels">Instagram Reels</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>

        {/* Min Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {texts.minDuration}
          </label>
          <select
            value={formData.minClipSeconds}
            onChange={(e) => setFormData({ ...formData, minClipSeconds: Number(e.target.value) as FormData["minClipSeconds"] })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={15}>15 {texts.seconds}</option>
            <option value={20}>20 {texts.seconds}</option>
            <option value={30}>30 {texts.seconds}</option>
          </select>
        </div>

        {/* Max Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {texts.maxDuration}
          </label>
          <select
            value={formData.maxClipSeconds}
            onChange={(e) => setFormData({ ...formData, maxClipSeconds: Number(e.target.value) as FormData["maxClipSeconds"] })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={30}>30 {texts.seconds}</option>
            <option value={45}>45 {texts.seconds}</option>
            <option value={60}>60 {texts.seconds}</option>
          </select>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {texts.style}
          </label>
          <select
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value as FormData["style"] })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="energetic">{texts.styleEnergetic}</option>
            <option value="calm">{texts.styleCalm}</option>
          </select>
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {texts.contentType}
          </label>
          <select
            value={formData.contentType}
            onChange={(e) => setFormData({ ...formData, contentType: e.target.value as FormData["contentType"] })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">{texts.contentTypes.none}</option>
            <option value="podcast">{texts.contentTypes.podcast}</option>
            <option value="tutorial">{texts.contentTypes.tutorial}</option>
            <option value="gaming">{texts.contentTypes.gaming}</option>
            <option value="interview">{texts.contentTypes.interview}</option>
            <option value="commentary">{texts.contentTypes.commentary}</option>
          </select>
        </div>

        {/* Allow Profanity */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowProfanity}
              onChange={(e) => setFormData({ ...formData, allowProfanity: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{texts.allowProfanity}</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || timestampCount < 30}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {texts.analyzing}
          </span>
        ) : (
          texts.analyze
        )}
      </button>
    </form>
  );
}
