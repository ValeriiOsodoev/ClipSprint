"use client";

import type { Lang } from "@/lib/i18n";

type LanguageToggleProps = {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
};

export default function LanguageToggle({ lang, onChangeLang }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      <button
        type="button"
        onClick={() => onChangeLang("ru")}
        aria-pressed={lang === "ru"}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
          lang === "ru"
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => onChangeLang("en")}
        aria-pressed={lang === "en"}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
          lang === "en"
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}
