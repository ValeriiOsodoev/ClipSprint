"use client";

import { useState, useCallback } from "react";
import NavHeader from "@/components/NavHeader";
import AnalyzeForm from "@/components/retention/AnalyzeForm";
import RetentionResultTabs from "@/components/retention/RetentionResultTabs";
import RetentionHistoryPanel from "@/components/retention/RetentionHistoryPanel";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types/retention";
import { addToRetentionHistory } from "@/lib/retention-storage";
import { useLang } from "@/lib/useLang";
import { getNavTexts, getToolConfigsTexts } from "@/lib/i18n";

export default function RetentionDoctorPage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  
  const { lang, setLang } = useLang();
  const nav = getNavTexts(lang);
  const toolConfigs = getToolConfigsTexts(lang);

  const handleAnalyze = useCallback(async (request: AnalyzeRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = (await res.json()) as
        | AnalyzeResponse
        | { error: { code: string; message: string } };

      if (!res.ok) {
        const errData = data as { error: { code: string; message: string } };
        setError(`${errData.error.code}: ${errData.error.message}`);
        return;
      }

      const responseData = data as AnalyzeResponse;
      setResult(responseData);
      addToRetentionHistory(request, responseData);
      setHistoryRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleHistorySelect = useCallback(
    (request: AnalyzeRequest, response: AnalyzeResponse) => {
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
              {toolConfigs.retentionDoctor.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {toolConfigs.retentionDoctor.tagline}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Form */}
            <div className="lg:col-span-1 space-y-6">
              <AnalyzeForm onSubmit={handleAnalyze} loading={loading} />
              <RetentionHistoryPanel
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Analyzing script for retention issues...
                    </p>
                  </div>
                </div>
              )}

              {!loading && result && <RetentionResultTabs data={result} />}

              {!loading && !result && !error && (
                <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-center px-4">
                    <p className="text-gray-500 dark:text-gray-400">
                      Paste your script and click Analyze to identify retention
                      issues
                    </p>
                    <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                      Get drop-off mapping, tight rewrites, pattern interrupts,
                      and b-roll suggestions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
