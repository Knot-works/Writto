import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import type { Improvement } from "@/types";

interface SentenceFeedbackProps {
  userAnswer: string;
  improvements: Improvement[];
  onAskAbout?: (index: number, improvement: Improvement) => void;
}

interface AnnotatedSegment {
  text: string;
  improvement?: Improvement;
  improvementIndex?: number;
  isHighlighted: boolean;
}

interface SentenceWithSegments {
  segments: AnnotatedSegment[];
  originalText: string;
}

// Split text into sentences
function splitIntoSentences(text: string): string[] {
  // Split by sentence-ending punctuation, keeping the punctuation
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => s.trim().length > 0);
}

// Create annotated segments for a single sentence
function createAnnotatedSegments(
  sentence: string,
  improvements: Improvement[],
  globalOffset: number
): AnnotatedSegment[] {
  if (improvements.length === 0) {
    return [{ text: sentence, isHighlighted: false }];
  }

  // Find improvement positions within this sentence
  const markers: Array<{
    start: number;
    end: number;
    improvement: Improvement;
    index: number;
  }> = [];

  improvements.forEach((imp, index) => {
    const lowerSentence = sentence.toLowerCase();
    const lowerOriginal = imp.original.toLowerCase();

    const pos = lowerSentence.indexOf(lowerOriginal);
    if (pos !== -1) {
      markers.push({
        start: pos,
        end: pos + imp.original.length,
        improvement: imp,
        index,
      });
    }
  });

  // Sort by position
  markers.sort((a, b) => a.start - b.start);

  // Remove overlapping markers
  const nonOverlapping: typeof markers = [];
  for (const marker of markers) {
    const lastMarker = nonOverlapping[nonOverlapping.length - 1];
    if (!lastMarker || marker.start >= lastMarker.end) {
      nonOverlapping.push(marker);
    }
  }

  // Create segments
  const segments: AnnotatedSegment[] = [];
  let currentPos = 0;

  for (const marker of nonOverlapping) {
    if (marker.start > currentPos) {
      segments.push({
        text: sentence.slice(currentPos, marker.start),
        isHighlighted: false,
      });
    }

    segments.push({
      text: sentence.slice(marker.start, marker.end),
      improvement: marker.improvement,
      improvementIndex: marker.index,
      isHighlighted: true,
    });

    currentPos = marker.end;
  }

  if (currentPos < sentence.length) {
    segments.push({
      text: sentence.slice(currentPos),
      isHighlighted: false,
    });
  }

  return segments;
}

// Parse user answer into sentences with annotated segments
function parseIntoSentences(
  userAnswer: string,
  improvements: Improvement[]
): SentenceWithSegments[] {
  const sentences = splitIntoSentences(userAnswer);
  let offset = 0;

  return sentences.map((sentence) => {
    const segments = createAnnotatedSegments(sentence, improvements, offset);
    offset += sentence.length + 1; // +1 for space between sentences
    return {
      segments,
      originalText: sentence,
    };
  });
}

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; underline: string; label: string }> = {
  grammar: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    underline: "decoration-rose-500/50",
    label: "文法",
  },
  vocabulary: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    underline: "decoration-amber-500/50",
    label: "語彙",
  },
  structure: {
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    text: "text-sky-600 dark:text-sky-400",
    underline: "decoration-sky-500/50",
    label: "構成",
  },
  content: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-600 dark:text-violet-400",
    underline: "decoration-violet-500/50",
    label: "内容",
  },
};

// Correction shown below the wavy underline
function InlineCorrection({
  segment,
}: {
  segment: AnnotatedSegment;
}) {
  if (!segment.isHighlighted || !segment.improvement) {
    return <span>{segment.text}</span>;
  }

  const style = TYPE_STYLES[segment.improvement.type] || TYPE_STYLES.grammar;

  return (
    <span className="inline-flex flex-col items-start">
      {/* Original text with wavy underline */}
      <span
        className={`
          rounded-sm px-0.5
          underline decoration-2 decoration-wavy ${style.underline}
        `}
      >
        {segment.text}
      </span>
      {/* Correction below */}
      <span
        className={`
          -mt-0.5 flex items-center gap-0.5 text-xs font-medium ${style.text}
        `}
      >
        <ChevronDown className="h-3 w-3" />
        {segment.improvement.suggested}
      </span>
    </span>
  );
}

export function SentenceFeedback({
  userAnswer,
  improvements,
  onAskAbout,
}: SentenceFeedbackProps) {
  const sentences = useMemo(
    () => parseIntoSentences(userAnswer, improvements),
    [userAnswer, improvements]
  );

  const hasImprovements = improvements.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-medium">あなたの回答</h2>
          {hasImprovements && (
            <p className="text-xs text-muted-foreground">
              {improvements.length}件の修正ポイントがあります
            </p>
          )}
        </div>
      </div>

      {/* User's text with inline corrections - sentence by sentence */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="space-y-4">
          {sentences.map((sentence, sentenceIndex) => (
            <p
              key={sentenceIndex}
              className="text-base leading-[2.4] tracking-wide text-foreground/90"
            >
              {sentence.segments.map((segment, segmentIndex) => (
                <InlineCorrection key={segmentIndex} segment={segment} />
              ))}
            </p>
          ))}
        </div>
      </div>

      {/* Detailed corrections list - always visible */}
      {hasImprovements && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">修正の詳細</p>
          <div className="space-y-3">
            {improvements.map((imp, index) => {
              const style = TYPE_STYLES[imp.type] || TYPE_STYLES.grammar;
              return (
                <div
                  key={index}
                  className={`
                    rounded-xl border ${style.border} ${style.bg}
                    p-4 transition-all
                  `}
                >
                  {/* Header with type badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className={`${style.bg} ${style.text} border-0 text-[10px] font-medium`}
                    >
                      {style.label}
                    </Badge>
                    {onAskAbout && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => onAskAbout(index, imp)}
                      >
                        <MessageCircle className="h-3 w-3" />
                        詳しく聞く
                      </Button>
                    )}
                  </div>

                  {/* Correction - vertical layout */}
                  <div className="mb-3 rounded-lg bg-background/80 px-3 py-2.5">
                    <p className="text-[15px] text-muted-foreground">
                      {imp.original}
                    </p>
                    <p className={`mt-1 text-[15px] font-semibold ${style.text}`}>
                      → {imp.suggested}
                    </p>
                  </div>

                  {/* Explanation */}
                  <p className="text-[15px] text-foreground/80 leading-relaxed">
                    {imp.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No improvements message */}
      {!hasImprovements && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="text-sm text-primary">
            素晴らしい！修正箇所はありませんでした。
          </p>
        </div>
      )}
    </div>
  );
}
