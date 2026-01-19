"use client";

import { useRef, useEffect, useCallback } from "react";

interface WaveformDisplayProps {
  /** Audio samples (mono Float32Array) */
  samples: Float32Array | null;
  /** Sample rate of the audio */
  sampleRate: number;
  /** Total duration in seconds */
  duration: number;
  /** Segments to highlight (speech regions) */
  segments?: Array<{ startMs: number; endMs: number; enabled: boolean }>;
  /** Height of the waveform canvas */
  height?: number;
  /** Color for the waveform */
  waveformColor?: string;
  /** Color for highlighted (speech) segments */
  highlightColor?: string;
  /** Color for disabled segments */
  disabledColor?: string;
  /** Color for cut (silence) regions */
  cutColor?: string;
  /** Label for the waveform */
  label?: string;
  /** Whether to show time markers */
  showTimeMarkers?: boolean;
}

export default function WaveformDisplay({
  samples,
  sampleRate,
  duration,
  segments = [],
  height = 100,
  waveformColor = "#6b7280",
  highlightColor = "#f97316",
  disabledColor = "#9ca3af",
  cutColor = "rgba(239, 68, 68, 0.3)",
  label,
  showTimeMarkers = true,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !samples || samples.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, width, height);

    // Calculate samples per pixel
    const samplesPerPixel = Math.ceil(samples.length / width);

    // Create array of min/max values for each pixel column
    const peaks: Array<{ min: number; max: number }> = [];
    
    for (let x = 0; x < width; x++) {
      const start = Math.floor((x / width) * samples.length);
      const end = Math.min(start + samplesPerPixel, samples.length);
      
      let min = 0;
      let max = 0;
      
      for (let i = start; i < end; i++) {
        const sample = samples[i];
        if (sample < min) min = sample;
        if (sample > max) max = sample;
      }
      
      peaks.push({ min, max });
    }

    // Draw cut regions (silence) first as background
    if (segments.length > 0) {
      ctx.fillStyle = cutColor;
      
      // Fill everything as cut first
      ctx.fillRect(0, 0, width, height);
      
      // Then clear the speech regions
      ctx.fillStyle = "#1f2937";
      for (const seg of segments) {
        if (seg.enabled) {
          const startX = (seg.startMs / 1000 / duration) * width;
          const endX = (seg.endMs / 1000 / duration) * width;
          ctx.fillRect(startX, 0, endX - startX, height);
        }
      }
    }

    // Draw waveform
    for (let x = 0; x < width; x++) {
      const peak = peaks[x];
      const timeS = (x / width) * duration;
      const timeMs = timeS * 1000;
      
      // Determine color based on segment
      let color = waveformColor;
      
      for (const seg of segments) {
        if (timeMs >= seg.startMs && timeMs <= seg.endMs) {
          color = seg.enabled ? highlightColor : disabledColor;
          break;
        }
      }
      
      ctx.fillStyle = color;
      
      const minY = centerY + peak.min * centerY * 0.9;
      const maxY = centerY + peak.max * centerY * 0.9;
      
      ctx.fillRect(x, minY, 1, maxY - minY || 1);
    }

    // Draw time markers
    if (showTimeMarkers) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      
      const markerCount = Math.min(10, Math.floor(duration / 5) + 1);
      const interval = duration / markerCount;
      
      for (let i = 0; i <= markerCount; i++) {
        const time = i * interval;
        const x = (time / duration) * width;
        
        // Draw tick
        ctx.fillRect(x, height - 15, 1, 5);
        
        // Draw time label
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        ctx.fillText(label, x, height - 2);
      }
    }
  }, [samples, sampleRate, duration, segments, height, waveformColor, highlightColor, disabledColor, cutColor, showTimeMarkers]);

  // Redraw on resize
  useEffect(() => {
    drawWaveform();
    
    const handleResize = () => drawWaveform();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [drawWaveform]);

  // Redraw when segments change
  useEffect(() => {
    drawWaveform();
  }, [segments, drawWaveform]);

  if (!samples || samples.length === 0) {
    return (
      <div 
        className="bg-gray-800 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        No audio data
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <div className="text-sm font-medium text-gray-400">{label}</div>
      )}
      <div ref={containerRef} className="relative rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ height }}
        />
      </div>
    </div>
  );
}
