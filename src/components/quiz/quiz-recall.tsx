import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, Eye } from "lucide-react";
import { speakEnglish, isSpeechAvailable, stopSpeech } from "@/lib/speech";
import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";

interface QuizRecallProps {
  question: QuizQuestionType;
  progress: number;
  total: number;
  onReveal: () => void;
}

export function QuizRecall({
  question,
  progress,
  total,
  onReveal,
}: QuizRecallProps) {
  const [speechAvailable, setSpeechAvailable] = useState(false);

  useEffect(() => {
    setSpeechAvailable(isSpeechAvailable());
    return () => stopSpeech();
  }, []);

  const handleSpeak = useCallback(() => {
    if (question.mode === "en-to-ja") {
      speakEnglish(question.vocabEntry.term);
    }
  }, [question.mode, question.vocabEntry.term]);

  // Keyboard shortcuts (Space or Enter to reveal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onReveal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onReveal]);

  // The question text (what we're asking about)
  const questionText = question.mode === "en-to-ja"
    ? question.vocabEntry.term
    : question.vocabEntry.meaning;

  // Label for the question
  const questionLabel = question.mode === "en-to-ja"
    ? "この英語の意味は？"
    : "この日本語を英語で？";

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {progress} / {total}
          </span>
          <Badge variant="outline" className="text-xs">
            {question.mode === "en-to-ja" ? "英→日" : "日→英"}
          </Badge>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="mb-6">
        <CardContent className="pt-12 pb-10 px-8 text-center">
          <p className="text-lg text-muted-foreground mb-5">
            {questionLabel}
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className={`font-serif text-5xl ${
              question.mode === "en-to-ja" ? "font-mono" : ""
            }`}>
              {questionText}
            </p>
            {/* Speaker button for English text */}
            {question.mode === "en-to-ja" && speechAvailable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0 shrink-0 text-muted-foreground hover:text-primary"
                onClick={handleSpeak}
                aria-label="発音を聞く"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            )}
          </div>
          {/* Show example if available and mode is en-to-ja */}
          {question.mode === "en-to-ja" && question.vocabEntry.example && (
            <p className="text-lg text-muted-foreground mt-6 italic">
              {question.vocabEntry.example}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reveal button */}
      <Button
        onClick={onReveal}
        variant="outline"
        className="w-full h-16 text-lg gap-3"
      >
        <Eye className="h-6 w-6" />
        答えを見る
        <kbd className="ml-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded">
          Space
        </kbd>
      </Button>
    </div>
  );
}
