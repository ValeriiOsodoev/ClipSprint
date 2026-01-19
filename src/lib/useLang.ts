"use client";

import { useState, useEffect, useCallback } from "react";
import { type Lang, DEFAULT_LANG, LANG_STORAGE_KEY } from "./i18n";

export function useLang() {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "ru") {
      setLangState(stored);
    }
    setIsLoaded(true);
  }, []);

  // Setter that also persists
  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  }, []);

  return { lang, setLang, isLoaded };
}
