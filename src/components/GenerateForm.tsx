"use client";

import { useState, useCallback } from "react";
import type { GenerateRequest } from "@/types";

type GenerateFormProps = {
  onSubmit: (request: GenerateRequest) => void;
  loading: boolean;
};

const EXAMPLE_DATA: GenerateRequest = {
  niche: "Программирование",
  topic: "Как начать изучать Python с нуля в 2026 году",
  durationMinutes: 10,
  style: "energetic",
  goal: "subs",
  outputLanguage: "ru",
};

export default function GenerateForm({ onSubmit, loading }: GenerateFormProps) {
  const [formData, setFormData] = useState<GenerateRequest>({
    niche: "",
    topic: "",
    durationMinutes: 10,
    style: "calm",
    goal: "views",
    outputLanguage: "ru",
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "durationMinutes"
            ? (parseInt(value, 10) as 2 | 5 | 10 | 20)
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Generate Script
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
        {/* Niche */}
        <div>
          <label
            htmlFor="niche"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Niche
          </label>
          <input
            type="text"
            id="niche"
            name="niche"
            value={formData.niche}
            onChange={handleChange}
            required
            maxLength={200}
            placeholder="e.g., Programming, Cooking, Fitness"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Topic */}
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Topic
          </label>
          <textarea
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            maxLength={500}
            rows={3}
            placeholder="Describe the specific topic of your video"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Duration */}
        <div>
          <label
            htmlFor="durationMinutes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Duration (minutes)
          </label>
          <select
            id="durationMinutes"
            name="durationMinutes"
            value={formData.durationMinutes}
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

        {/* Goal */}
        <div>
          <label
            htmlFor="goal"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Goal
          </label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="views">Views (watch till end)</option>
            <option value="subs">Subscribers</option>
            <option value="sales">Sales</option>
          </select>
        </div>

        {/* Output Language */}
        <div>
          <label
            htmlFor="outputLanguage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Output Language
          </label>
          <select
            id="outputLanguage"
            name="outputLanguage"
            value={formData.outputLanguage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !formData.niche || !formData.topic}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </form>
  );
}
