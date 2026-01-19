"use client";

import { useState, useCallback } from "react";
import type { AnalyzeRequest } from "@/types/retention";

type AnalyzeFormProps = {
  onSubmit: (request: AnalyzeRequest) => void;
  loading: boolean;
};

const EXAMPLE_SCRIPT_RU = `Привет! Сегодня я расскажу вам о том, как стать продуктивнее. Многие люди хотят успевать больше, но не знают с чего начать.

Первое, что нужно сделать — это составить список дел. Да, я знаю, это звучит банально, но это действительно работает. Вы просто берёте листок бумаги и записываете всё, что вам нужно сделать.

Второе — это приоритизация. Не все задачи одинаково важны. Некоторые можно отложить, а некоторые нужно сделать прямо сейчас. Поэтому важно понимать, что действительно срочно.

Третье — это фокус. Многие отвлекаются на соцсети, сообщения, звонки. Попробуйте выключить уведомления хотя бы на час. Вы удивитесь, насколько больше успеете.

В общем, продуктивность — это навык, который можно развить. Главное — начать действовать. Спасибо за просмотр, ставьте лайки и подписывайтесь!`;

const EXAMPLE_DATA: AnalyzeRequest = {
  scriptText: EXAMPLE_SCRIPT_RU,
  videoLengthMinutes: 5,
  style: "energetic",
  language: "ru",
  interruptFrequencySeconds: 30,
  audience: "молодые профессионалы 25-35 лет",
};

export default function AnalyzeForm({ onSubmit, loading }: AnalyzeFormProps) {
  const [formData, setFormData] = useState<AnalyzeRequest>({
    scriptText: "",
    videoLengthMinutes: 5,
    style: "calm",
    language: "ru",
    interruptFrequencySeconds: 30,
    audience: "",
  });

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "videoLengthMinutes" || name === "interruptFrequencySeconds"
            ? parseInt(value, 10)
            : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const handleUseExample = useCallback(() => {
    setFormData(EXAMPLE_DATA);
  }, []);

  const wordCount = formData.scriptText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analyze Script
        </h2>
        <button
          type="button"
          onClick={handleUseExample}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Use example
        </button>
      </div>

      <div className="space-y-4">
        {/* Script Text */}
        <div>
          <label
            htmlFor="scriptText"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Script Text
          </label>
          <textarea
            id="scriptText"
            name="scriptText"
            value={formData.scriptText}
            onChange={handleChange}
            required
            rows={10}
            placeholder="Paste your YouTube script here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {wordCount} words • {formData.scriptText.length} characters
          </p>
        </div>

        {/* Video Length */}
        <div>
          <label
            htmlFor="videoLengthMinutes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Video Length (minutes)
          </label>
          <select
            id="videoLengthMinutes"
            name="videoLengthMinutes"
            value={formData.videoLengthMinutes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={2}>2 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={20}>20 minutes</option>
          </select>
        </div>

        {/* Style */}
        <div>
          <label
            htmlFor="style"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Style
          </label>
          <select
            id="style"
            name="style"
            value={formData.style}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="calm">Calm</option>
            <option value="energetic">Energetic</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Interrupt Frequency */}
        <div>
          <label
            htmlFor="interruptFrequencySeconds"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Pattern Interrupt Frequency
          </label>
          <select
            id="interruptFrequencySeconds"
            name="interruptFrequencySeconds"
            value={formData.interruptFrequencySeconds}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={20}>Every 20 seconds (aggressive)</option>
            <option value={30}>Every 30 seconds (recommended)</option>
            <option value={45}>Every 45 seconds (moderate)</option>
            <option value={60}>Every 60 seconds (minimal)</option>
          </select>
        </div>

        {/* Audience (optional) */}
        <div>
          <label
            htmlFor="audience"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Target Audience{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="audience"
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            maxLength={200}
            placeholder="e.g., tech enthusiasts, beginners, professionals 25-40"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !formData.scriptText.trim()}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {loading ? "Analyzing..." : "Analyze Script"}
        </button>
      </div>
    </form>
  );
}
