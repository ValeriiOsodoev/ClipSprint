"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import SilenceCutterForm from "@/components/silence-cutter/SilenceCutterForm";
import SilenceCutterResults from "@/components/silence-cutter/SilenceCutterResults";
import SilenceCutterHistoryPanel from "@/components/silence-cutter/SilenceCutterHistoryPanel";

import { useLang } from "@/lib/useLang";
import { getNavTexts, getFooterTexts, type Lang } from "@/lib/i18n";
import {
  extractAudioFromVideo,
  calculateKeptDuration,
} from "@/lib/audio-analysis";
import {
  audioBufferToWavBlob,
  transcribeAudio,
  generateSegmentsFromTranscription,
  type TranscriptionResult,
} from "@/lib/transcription-analysis";
import { getDefaultParamsForPreset } from "@/lib/silence-cutter-schemas";
import {
  getSilenceCutterHistory,
  saveSilenceCutterEntry,
  deleteSilenceCutterEntry,
  clearSilenceCutterHistory,
} from "@/lib/silence-cutter-storage";
import {
  downloadEdl,
  downloadCutListJson,
} from "@/lib/silence-cutter-edl";

import type {
  SpeechSegment,
  ProcessingState,
  UserSettings,
  DetectionParams,
  SilenceCutterHistoryEntry,
} from "@/types/silence-cutter";

// ============================================
// Translations
// ============================================

function getTexts(lang: Lang) {
  return lang === "en"
    ? {
        pageTitle: "Silence Remover",
        pageDescription: "Remove silence from your videos automatically while keeping natural pacing",
        form: {
          uploadTitle: "Upload your video",
          uploadDescription: "Drag and drop or click to select a video file",
          uploadButton: "Choose file",
          dropHere: "Drop your video here",
          supportedFormats: "Supported: MP4, MOV, WebM, MKV, AVI",
          fileSizeWarning: "Large file - processing may take a while",
          presetLabel: "Cut style",
          presetGentle: "🌿 Gentle — preserve natural pacing",
          presetNormal: "⚖️ Normal — balanced cuts",
          presetAggressive: "⚡ Aggressive — tight cuts",
          contentTypeLabel: "Content type",
          contentTalkingHead: "🎤 Talking head",
          contentTutorial: "📚 Tutorial",
          contentPodcast: "🎙️ Podcast",
          contentScreenRecording: "💻 Screen recording",
          naturalnessLabel: "Naturalness",
          naturalnessLow: "Tighter",
          naturalnessHigh: "Natural",
          minSilenceLabel: "Minimum silence to remove",
          analyzeButton: "Analyze video",
          analyzingButton: "Analyzing...",
        },
        results: {
          statsTitle: "Analysis Results",
          originalDuration: "Original",
          newDuration: "New",
          timeRemoved: "Removed",
          numberOfCuts: "Cuts",
          segmentsTitle: "Segments to keep",
          segmentStart: "Start",
          segmentEnd: "End",
          segmentDuration: "Duration",
          segmentEnabled: "Keep",
          noSegments: "No speech segments detected",
          exportVideoButton: "Export trimmed video",
          exportingButton: "Exporting...",
          downloadJsonButton: "JSON",
          downloadEdlButton: "EDL",
          processingStage: "Processing",
          ffmpegNotReady: "Loading processor...",
        },
        history: {
          title: "History",
          empty: "No exports yet",
          clearAll: "Clear all",
          confirmClear: "Clear all history?",
          open: "Open",
          delete: "Delete",
          timeRemoved: "removed",
          cuts: "cuts",
        },
        processing: {
          loadingVideo: "Loading video...",
          extractingAudio: "Extracting audio...",
          transcribingAudio: "Transcribing speech...",
          analyzingPauses: "Analyzing pauses...",
          generatingSegments: "Generating cut points...",
          exporting: "Exporting trimmed video...",
          complete: "Done!",
          error: "An error occurred",
        },
        ffmpegLoading: "Loading video processor...",
        ffmpegNotSupported: "Your browser doesn't support video processing. Try Chrome or Edge.",
      }
    : {
        pageTitle: "Удаление пауз",
        pageDescription: "Автоматическое удаление тишины из видео с сохранением естественного темпа",
        form: {
          uploadTitle: "Загрузите видео",
          uploadDescription: "Перетащите или нажмите, чтобы выбрать файл",
          uploadButton: "Выбрать файл",
          dropHere: "Отпустите файл здесь",
          supportedFormats: "Поддерживаются: MP4, MOV, WebM, MKV, AVI",
          fileSizeWarning: "Большой файл — обработка может занять время",
          presetLabel: "Стиль обрезки",
          presetGentle: "🌿 Мягкий — сохраняет естественный темп",
          presetNormal: "⚖️ Обычный — сбалансированная обрезка",
          presetAggressive: "⚡ Агрессивный — максимальная обрезка",
          contentTypeLabel: "Тип контента",
          contentTalkingHead: "🎤 Разговорное видео",
          contentTutorial: "📚 Туториал",
          contentPodcast: "🎙️ Подкаст",
          contentScreenRecording: "💻 Запись экрана",
          naturalnessLabel: "Естественность",
          naturalnessLow: "Плотнее",
          naturalnessHigh: "Естественнее",
          minSilenceLabel: "Минимальная пауза для удаления",
          analyzeButton: "Анализировать видео",
          analyzingButton: "Анализируем...",
        },
        results: {
          statsTitle: "Результаты анализа",
          originalDuration: "Исходное",
          newDuration: "Новое",
          timeRemoved: "Удалено",
          numberOfCuts: "Разрезов",
          segmentsTitle: "Сегменты для сохранения",
          segmentStart: "Начало",
          segmentEnd: "Конец",
          segmentDuration: "Длина",
          segmentEnabled: "Сохранить",
          noSegments: "Речевые сегменты не обнаружены",
          exportVideoButton: "Экспортировать видео",
          exportingButton: "Экспортируем...",
          downloadJsonButton: "JSON",
          downloadEdlButton: "EDL",
          processingStage: "Обработка",
          ffmpegNotReady: "Загрузка...",
        },
        history: {
          title: "История",
          empty: "Пока нет экспортов",
          clearAll: "Очистить всё",
          confirmClear: "Очистить всю историю?",
          open: "Открыть",
          delete: "Удалить",
          timeRemoved: "удалено",
          cuts: "разрезов",
        },
        processing: {
          loadingVideo: "Загружаем видео...",
          extractingAudio: "Извлекаем аудио...",
          transcribingAudio: "Транскрибируем речь...",
          analyzingPauses: "Анализируем паузы...",
          generatingSegments: "Определяем точки разреза...",
          exporting: "Экспортируем видео...",
          complete: "Готово!",
          error: "Произошла ошибка",
        },
        ffmpegLoading: "Загружаем обработчик видео...",
        ffmpegNotSupported: "Ваш браузер не поддерживает обработку видео. Попробуйте Chrome или Edge.",
      };
}

// ============================================
// Main Component
// ============================================

export default function SilenceCutterPage() {
  const { lang, setLang, isLoaded } = useLang();
  const texts = getTexts(lang);
  const nav = getNavTexts(lang);
  const footer = getFooterTexts(lang);

  // FFmpeg state
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegSupported, setFfmpegSupported] = useState(true);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Analysis state
  const [segments, setSegments] = useState<SpeechSegment[]>([]);
  const [audioSamples, setAudioSamples] = useState<Float32Array | null>(null);
  const [sampleRate, setSampleRate] = useState(16000);

  // Processing state
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: "idle",
    progress: 0,
    message: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // History state
  const [history, setHistory] = useState<SilenceCutterHistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(getSilenceCutterHistory());
  }, []);

  // Load FFmpeg WASM
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current || ffmpegLoading) return;

    setFfmpegLoading(true);
    try {
      const ffmpeg = new FFmpeg();

      // Try loading FFmpeg - use umd build which is more compatible
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
      } catch (loadError) {
        console.warn("FFmpeg load failed, trying without worker:", loadError);
        // Retry with classWorkerURL disabled for environments without SharedArrayBuffer
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
          classWorkerURL: undefined,
        });
      }

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      setFfmpegSupported(false);
    } finally {
      setFfmpegLoading(false);
    }
  }, [ffmpegLoading]);

  // Load FFmpeg on mount
  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setVideoFile(file);
    setVideoLoaded(false);
    setSegments([]);

    // Get video duration using HTML5 video element
    const video = document.createElement("video");
    video.preload = "metadata";

    const loadPromise = new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setVideoLoaded(true);
        resolve();
      };
      video.onerror = () => {
        console.error("Failed to load video metadata");
        resolve();
      };
    });

    video.src = URL.createObjectURL(file);
    await loadPromise;
    URL.revokeObjectURL(video.src);
  }, []);

  // Analyze video
  const handleAnalyze = useCallback(
    async (settings: UserSettings) => {
      if (!videoFile || isAnalyzing) return;

      setIsAnalyzing(true);
      setProcessingState({
        stage: "extracting_audio",
        progress: 0,
        message: texts.processing.extractingAudio,
      });

      try {
        // Stage 1: Extract audio from video
        const { samples, sampleRate: sr, duration } = await extractAudioFromVideo(
          videoFile,
          (progress) => {
            setProcessingState({
              stage: "extracting_audio",
              progress: progress * 0.2,
              message: texts.processing.extractingAudio,
            });
          }
        );

        setAudioSamples(samples);
        setSampleRate(sr);

        // Stage 2: Convert audio to WAV for transcription API
        setProcessingState({
          stage: "transcribing",
          progress: 20,
          message: texts.processing.transcribingAudio,
        });

        const audioBlob = audioBufferToWavBlob(samples, sr);
        
        // Stage 3: Transcribe audio using Whisper API
        let transcription: TranscriptionResult;
        try {
          transcription = await transcribeAudio(audioBlob, `${videoFile.name}.wav`);
        } catch (transcriptionError) {
          console.error("Transcription failed:", transcriptionError);
          throw new Error("Failed to transcribe audio. Please check your API key.");
        }

        setProcessingState({
          stage: "analyzing_pauses",
          progress: 60,
          message: texts.processing.analyzingPauses,
        });

        // Stage 4: Generate segments from transcription
        // Map naturalness slider to params adjustment
        const naturalnessMultiplier = settings.naturalness / 50; // 0-2 range
        const params: DetectionParams = {
          ...getDefaultParamsForPreset(settings.preset),
          minimumSilenceMs: settings.minSilenceToRemove,
          keepShortPausesUnderMs: Math.round(200 + naturalnessMultiplier * 200), // 200-600
          prePadMs: Math.round(100 + naturalnessMultiplier * 100), // 100-300
          postPadMs: Math.round(120 + naturalnessMultiplier * 130), // 120-380
          mergeGapMs: Math.round(150 + naturalnessMultiplier * 150), // 150-450
        };

        setProcessingState({
          stage: "generating_segments",
          progress: 80,
          message: texts.processing.generatingSegments,
        });

        // Generate speech segments from transcription word timestamps
        const speechSegments = generateSegmentsFromTranscription(
          transcription,
          params,
          duration
        );

        setSegments(speechSegments);

        setProcessingState({
          stage: "complete",
          progress: 100,
          message: texts.processing.complete,
        });
      } catch (error) {
        console.error("Analysis failed:", error);
        setProcessingState({
          stage: "error",
          progress: 0,
          message: texts.processing.error,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [videoFile, isAnalyzing, texts.processing]
  );

  // Toggle segment enabled state
  const handleToggleSegment = useCallback((id: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  // Export video using FFmpeg WASM
  const handleExportVideo = useCallback(async () => {
    if (!ffmpegRef.current || !videoFile || segments.length === 0) return;

    const enabledSegments = segments.filter((s) => s.enabled);
    if (enabledSegments.length === 0) return;

    setIsExporting(true);
    setProcessingState({
      stage: "exporting",
      progress: 0,
      message: texts.processing.exporting,
    });

    try {
      const ffmpeg = ffmpegRef.current;

      // Write input file
      const inputData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", inputData);

      // Build filter complex for segment concatenation
      // This approach uses trim and concat filters
      const filterParts: string[] = [];
      const concatInputs: string[] = [];

      enabledSegments.forEach((segment, i) => {
        // Trim video and audio for each segment
        // Add small crossfade by overlapping segments slightly (30ms)
        const start = Math.max(0, segment.startSeconds);
        const end = segment.endSeconds;

        filterParts.push(
          `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}]`
        );
        filterParts.push(
          `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${i}]`
        );
        concatInputs.push(`[v${i}][a${i}]`);
      });

      // Concat all segments
      const filterComplex = [
        ...filterParts,
        `${concatInputs.join("")}concat=n=${enabledSegments.length}:v=1:a=1[outv][outa]`,
      ].join(";");

      // Set up progress handler
      ffmpeg.on("progress", (event: { progress: number }) => {
        setProcessingState({
          stage: "exporting",
          progress: Math.round(event.progress * 100),
          message: texts.processing.exporting,
        });
      });

      // Run FFmpeg
      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-filter_complex",
        filterComplex,
        "-map",
        "[outv]",
        "-map",
        "[outa]",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        "output.mp4",
      ]);

      // Read output and download
      const data = await ffmpeg.readFile("output.mp4");
      // FFmpeg WASM returns Uint8Array, create new ArrayBuffer to avoid SharedArrayBuffer type issues
      const uint8Data = data as unknown as Uint8Array;
      const arrayBuffer = uint8Data.buffer.slice(uint8Data.byteOffset, uint8Data.byteOffset + uint8Data.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = videoFile.name.replace(/\.[^/.]+$/, "_trimmed.mp4");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Clean up FFmpeg files
      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");

      // Save to history
      const entry = saveSilenceCutterEntry(
        videoFile.name,
        videoDuration,
        calculateKeptDuration(segments),
        "normal", // Could store actual preset
        "talking_head", // Could store actual content type
        enabledSegments.map((s) => ({
          startSeconds: s.startSeconds,
          endSeconds: s.endSeconds,
        }))
      );
      setHistory((prev) => [entry, ...prev].slice(0, 20));

      setProcessingState({
        stage: "complete",
        progress: 100,
        message: texts.processing.complete,
      });
    } catch (error) {
      console.error("Export failed:", error);
      setProcessingState({
        stage: "error",
        progress: 0,
        message: texts.processing.error,
        error: error instanceof Error ? error.message : "Export failed",
      });
    } finally {
      setIsExporting(false);
    }
  }, [videoFile, segments, videoDuration, texts.processing]);

  // Download handlers
  const handleDownloadJson = useCallback(() => {
    if (!videoFile || segments.length === 0) return;
    downloadCutListJson(segments, videoFile.name, videoDuration);
  }, [videoFile, segments, videoDuration]);

  const handleDownloadEdl = useCallback(() => {
    if (!videoFile || segments.length === 0) return;
    downloadEdl(segments, videoFile.name);
  }, [videoFile, segments]);

  // History handlers
  const handleHistoryOpen = useCallback((entry: SilenceCutterHistoryEntry) => {
    // Restore segments from history entry
    const restored: SpeechSegment[] = entry.keptSegments.map((s, i) => ({
      id: `restored-${i}`,
      startSeconds: s.startSeconds,
      endSeconds: s.endSeconds,
      durationSeconds: s.endSeconds - s.startSeconds,
      enabled: true,
    }));
    setSegments(restored);
    setVideoDuration(entry.originalDuration);
  }, []);

  const handleHistoryDelete = useCallback((id: string) => {
    deleteSilenceCutterEntry(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleHistoryClear = useCallback(() => {
    clearSilenceCutterHistory();
    setHistory([]);
  }, []);

  return (
    <div
      className={isLoaded ? "opacity-100" : "opacity-0"}
      style={{ transition: "opacity 0.15s ease-in" }}
    >
      <NavHeader
        lang={lang}
        onChangeLang={setLang}
        labels={{
          scriptKit: nav.scriptKit,
          retentionDoctor: nav.retentionDoctor,
          clipFactory: nav.clipFactory,
          silenceCutter: nav.silenceCutter,
        }}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium mb-3">
              ✂️ {texts.pageTitle}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {texts.pageTitle}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {texts.pageDescription}
            </p>
          </div>

          {/* FFmpeg loading/error states */}
          {!ffmpegSupported && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
              <p className="text-red-700 dark:text-red-400">
                {texts.ffmpegNotSupported}
              </p>
            </div>
          )}

          {ffmpegLoading && (
            <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl text-center">
              <div className="flex items-center justify-center gap-3">
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
                <p className="text-orange-700 dark:text-orange-400">
                  {texts.ffmpegLoading}
                </p>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Form & Results */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <SilenceCutterForm
                  onFileSelect={handleFileSelect}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  isVideoLoaded={videoLoaded}
                  texts={texts.form}
                />
              </div>

              {(segments.length > 0 || processingState.stage !== "idle") && (
                <SilenceCutterResults
                  segments={segments}
                  onToggleSegment={handleToggleSegment}
                  originalDuration={videoDuration}
                  processingState={processingState}
                  onExportVideo={handleExportVideo}
                  onDownloadJson={handleDownloadJson}
                  onDownloadEdl={handleDownloadEdl}
                  isExporting={isExporting}
                  ffmpegReady={ffmpegLoaded}
                  audioSamples={audioSamples}
                  audioSampleRate={sampleRate}
                  texts={texts.results}
                />
              )}
            </div>

            {/* Right: History */}
            <div className="lg:col-span-1">
              <SilenceCutterHistoryPanel
                history={history}
                onOpen={handleHistoryOpen}
                onDelete={handleHistoryDelete}
                onClear={handleHistoryClear}
                texts={texts.history}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer
        labels={{
          scriptKit: footer.scriptKit,
          retentionDoctor: footer.retentionDoctor,
          clipFactory: footer.clipFactory,
          silenceCutter: footer.silenceCutter,
          tagline: footer.tagline,
        }}
      />
    </div>
  );
}
