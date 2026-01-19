"use client";

import { useState, useCallback } from "react";
import NavHeader from "@/components/NavHeader";
import GenerateForm from "@/components/GenerateForm";
import ResultTabs from "@/components/ResultTabs";
import HistoryPanel from "@/components/HistoryPanel";
import type { GenerateRequest, GenerateResponse } from "@/types";
import { addToHistory } from "@/lib/storage";
import { useLang } from "@/lib/useLang";
import { getNavTexts, getToolConfigsTexts } from "@/lib/i18n";

export default function ScriptKitPage() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  
  const { lang, setLang } = useLang();
  const nav = getNavTexts(lang);
  const toolConfigs = getToolConfigsTexts(lang);

  const handleGenerate = useCallback(async (request: GenerateRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok) {
        const errData = data as { error: { code: string; message: string } };
        setError(`${errData.error.code}: ${errData.error.message}`);
        return;
      }

      const responseData = data as GenerateResponse;
      setResult(responseData);
      addToHistory(request, responseData);
      setHistoryRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleHistorySelect = useCallback(
    (request: GenerateRequest, response: GenerateResponse) => {
      setResult(response);
      setError(null);
    },
    []
  );

  const handleHistoryChange = useCallback(() => {
    setHistoryRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <NavHeader 
        lang={lang} 
        onChangeLang={setLang} 
        labels={{ 
          scriptKit: nav.scriptKit, 
          retentionDoctor: nav.retentionDoctor, 
          clipFactory: nav.clipFactory, 
          silenceCutter: nav.silenceCutter,
          signIn: nav.signIn,
          signOut: nav.signOut
        }} 
      />
      <main className="min-h-screen px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {toolConfigs.scriptKit.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {toolConfigs.scriptKit.tagline}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Form */}
            <div className="lg:col-span-1 space-y-6">
              <GenerateForm onSubmit={handleGenerate} loading={loading} />
              <HistoryPanel
                key={historyRefreshKey}
                onSelect={handleHistorySelect}
                onDelete={handleHistoryChange}
              />
            </div>

            {/* Right column: Results */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Generating script...
                    </p>
                  </div>
                </div>
              )}

              {!loading && result && <ResultTabs data={result} />}

              {!loading && !result && !error && (
                <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">
                    Fill out the form and click Generate to create your script
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
