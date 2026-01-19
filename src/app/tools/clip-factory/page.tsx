"use client";

import { useState, useEffect } from "react";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import ClipFactoryForm from "@/components/clip-factory/ClipFactoryForm";
import ClipFactoryResults from "@/components/clip-factory/ClipFactoryResults";
import ClipFactoryHistoryPanel from "@/components/clip-factory/ClipFactoryHistoryPanel";
import type { ClipFactoryResponse, ClipFactoryRequest } from "@/types/clip-factory";
import { saveClipFactoryResult } from "@/lib/clip-factory-storage";
import { type Lang, DEFAULT_LANG, LANG_STORAGE_KEY } from "@/lib/i18n";

// Translations
const texts = {
  en: {
    pageTitle: "Clip Finder",
    pageSubtitle: "Turn long transcripts into 10 high-quality short-form clips",
    form: {
      title: "Analyze Transcript",
      pasteTranscript: "Paste timestamped transcript",
      uploadFile: "Upload .txt file",
      platform: "Platform",
      minDuration: "Min duration",
      maxDuration: "Max duration",
      style: "Style",
      styleCalm: "Calm",
      styleEnergetic: "Energetic",
      allowProfanity: "Allow profanity",
      contentType: "Content type",
      contentTypes: {
        none: "Auto-detect",
        podcast: "Podcast",
        tutorial: "Tutorial",
        gaming: "Gaming",
        interview: "Interview",
        commentary: "Commentary",
      },
      analyze: "Find 10 Clips",
      analyzing: "Analyzing transcript...",
      timestampCount: "{count} timestamped lines detected",
      noTimestamps: "No timestamps detected. Please paste a transcript with timestamps (e.g., [00:01:23] or 1:23).",
      notEnoughLines: "Only {count} timestamped lines found. Need at least 30 for quality clips.",
      seconds: "sec",
    },
    results: {
      results: "Clip Candidates",
      clipNumber: "Clip #{n}",
      duration: "Duration",
      seconds: "s",
      coldOpen: "Cold Open",
      subtitles: "Subtitles",
      whyItWorks: "Why It Works",
      copyTitle: "Copy Title",
      copyColdOpen: "Copy Cold Open",
      copySubtitles: "Copy Subtitles",
      downloadEdl: "Download EDL",
      downloadJson: "Download JSON",
      profanityWarning: "Contains profanity",
    },
    history: {
      history: "History",
      noHistory: "No previous analyses. Results will appear here.",
      clearAll: "Clear all",
      confirmClear: "Delete all history entries?",
      segments: "segments",
      clips: "clips",
      open: "Open",
      delete: "Delete",
    },
    errors: {
      requestFailed: "Request failed. Please try again.",
    },
    nav: {
      scriptKit: "Script Generator",
      retentionDoctor: "Retention Fixer",
      clipFactory: "Clip Finder",
      silenceCutter: "Silence Remover",
      signIn: "Sign in",
      signOut: "Sign out",
    },
    footer: {
      scriptKit: "Script Generator",
      retentionDoctor: "Retention Fixer",
      clipFactory: "Clip Finder",
      silenceCutter: "Silence Remover",
      tagline: "Built for creators. No data stored.",
    },
  },
  ru: {
    pageTitle: "Поиск клипов",
    pageSubtitle: "Превращает длинный транскрипт в 10 качественных коротких клипов",
    form: {
      title: "Анализ транскрипта",
      pasteTranscript: "Вставьте транскрипт с таймкодами",
      uploadFile: "Загрузить .txt файл",
      platform: "Платформа",
      minDuration: "Мин. длительность",
      maxDuration: "Макс. длительность",
      style: "Стиль",
      styleCalm: "Спокойный",
      styleEnergetic: "Энергичный",
      allowProfanity: "Разрешить мат",
      contentType: "Тип контента",
      contentTypes: {
        none: "Автоопределение",
        podcast: "Подкаст",
        tutorial: "Туториал",
        gaming: "Гейминг",
        interview: "Интервью",
        commentary: "Комментарий",
      },
      analyze: "Найти 10 клипов",
      analyzing: "Анализируем транскрипт...",
      timestampCount: "Найдено строк с таймкодами: {count}",
      noTimestamps: "Таймкоды не найдены. Вставьте транскрипт с таймкодами (например, [00:01:23] или 1:23).",
      notEnoughLines: "Найдено только {count} строк. Для качественных клипов нужно минимум 30.",
      seconds: "сек",
    },
    results: {
      results: "Найденные клипы",
      clipNumber: "Клип #{n}",
      duration: "Длительность",
      seconds: "с",
      coldOpen: "Первая фраза",
      subtitles: "Субтитры",
      whyItWorks: "Почему работает",
      copyTitle: "Копировать название",
      copyColdOpen: "Копировать первую фразу",
      copySubtitles: "Копировать субтитры",
      downloadEdl: "Скачать EDL",
      downloadJson: "Скачать JSON",
      profanityWarning: "Содержит мат",
    },
    history: {
      history: "История",
      noHistory: "Пока нет анализов. Результаты появятся здесь.",
      clearAll: "Очистить всё",
      confirmClear: "Удалить всю историю?",
      segments: "сегментов",
      clips: "клипов",
      open: "Открыть",
      delete: "Удалить",
    },
    errors: {
      requestFailed: "Ошибка запроса. Попробуйте ещё раз.",
    },
    nav: {
      scriptKit: "Генератор скриптов",
      retentionDoctor: "Исправление удержания",
      clipFactory: "Поиск клипов",
      silenceCutter: "Удаление пауз",
      signIn: "Войти",
      signOut: "Выйти",
    },
    footer: {
      scriptKit: "Генератор скриптов",
      retentionDoctor: "Исправление удержания",
      clipFactory: "Поиск клипов",
      silenceCutter: "Удаление пауз",
      tagline: "Создано для ютуберов. Данные не хранятся.",
    },
  },
};

export default function ClipFactoryPage() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClipFactoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Load language from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "ru") {
      setLang(stored);
    } else {
      localStorage.setItem(LANG_STORAGE_KEY, DEFAULT_LANG);
    }
    setIsLoaded(true);
  }, []);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  };

  const t = texts[lang];

  const handleSubmit = async (
    segments: { t: string; tSeconds: number; text: string }[],
    options: Omit<ClipFactoryRequest, "segments">
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const request: ClipFactoryRequest = {
      ...options,
      segments,
    };

    try {
      const res = await fetch("/api/clip-factory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error?.message || t.errors.requestFailed);
        return;
      }

      setResult(data as ClipFactoryResponse);
      saveClipFactoryResult(request, data);
      setHistoryRefresh((n) => n + 1);
    } catch {
      setError(t.errors.requestFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (response: ClipFactoryResponse) => {
    setResult(response);
    setError(null);
  };

  return (
    <div className={isLoaded ? "opacity-100" : "opacity-0"} style={{ transition: "opacity 0.15s ease-in" }}>
      <NavHeader
        lang={lang}
        onChangeLang={handleLangChange}
        labels={t.nav}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.pageTitle}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t.pageSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <ClipFactoryForm
                  lang={lang}
                  texts={t.form}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Results */}
              {result && (
                <ClipFactoryResults data={result} texts={t.results} />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ClipFactoryHistoryPanel
                onSelect={handleHistorySelect}
                texts={t.history}
                refreshTrigger={historyRefresh}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer labels={t.footer} />
    </div>
  );
}
