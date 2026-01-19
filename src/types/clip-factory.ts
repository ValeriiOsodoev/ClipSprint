export type ClipSubtitle = {
  startOffsetSeconds: number;
  endOffsetSeconds: number;
  line1: string;
  line2?: string;
};

export type Clip = {
  id: string;
  start: string;
  end: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  clipTitle: string;
  coldOpenLine: string;
  subtitles: ClipSubtitle[];
  whyThisClipWorks: string;
  containsProfanity: boolean;
};

export type ClipFactoryResponse = {
  clips: Clip[];
};

export type ClipFactoryError = {
  error: {
    code: "BAD_REQUEST" | "LLM_ERROR" | "PARSE_ERROR" | "RATE_LIMIT";
    message: string;
  };
};

export type TranscriptSegment = {
  tLabel: string;
  tSeconds: number;
  text: string;
};

export type ClipFactoryRequest = {
  language: "ru" | "en";
  targetPlatform: "shorts" | "reels" | "tiktok";
  minClipSeconds: 15 | 20 | 30;
  maxClipSeconds: 30 | 45 | 60;
  style: "calm" | "energetic";
  allowProfanity: boolean;
  contentType: "podcast" | "tutorial" | "gaming" | "interview" | "commentary" | "";
  segments: { t: string; tSeconds: number; text: string }[];
};

export type ClipFactoryHistoryEntry = {
  id: string;
  timestamp: number;
  request: Omit<ClipFactoryRequest, "segments"> & { segmentCount: number };
  response: ClipFactoryResponse;
};
