import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Volume2 } from "lucide-react";
import { speakEnglish, isSpeechAvailable, stopSpeech } from "@/lib/speech";
import { getNextReviewPreview } from "@/lib/srs";
import type { QuizQuestion } from "@/types/quiz";
import type { SRSRating } from "@/types";
import { SRS_RATING_LABELS } from "@/types";

interface QuizFeedbackProps {
  question: QuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
  isRecallMode?: boolean;
  onRate: (rating: SRSRating) => void;
}

export function QuizFeedback({
  question,
  selectedIndex,
  isCorrect,
  isRecallMode = false,
  onRate,
}: QuizFeedbackProps) {
  const [speechAvailable, setSpeechAvailable] = useState(false);

  useEffect(() => {
    setSpeechAvailable(isSpeechAvailable());
    return () => stopSpeech();
  }, []);

  // Get next review interval previews
  const intervalPreviews = getNextReviewPreview(question.vocabEntry);

  const correctAnswer = question.choices[question.correctIndex];
  const selectedAnswer = question.choices[selectedIndex];

  const handleSpeak = useCallback(() => {
    speakEnglish(question.vocabEntry.term);
  }, [question.vocabEntry.term]);

  // The question text
  const questionText = question.mode === "en-to-ja"
    ? question.vocabEntry.term
    : question.vocabEntry.meaning;

  // The answer text (what the user should have answered)
  const answerText = question.mode === "en-to-ja"
    ? question.vocabEntry.meaning
    : question.vocabEntry.term;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "1":
          onRate("again");
          break;
        case "2":
          onRate("hard");
          break;
        case "3":
        case "Enter":
        case " ":
          e.preventDefault();
          onRate("good");
          break;
        case "4":
          onRate("easy");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRate]);

  const ratings: SRSRating[] = ["again", "hard", "good", "easy"];

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Result indicator (only for choice mode) */}
      {!isRecallMode && (
        <>
          <div className="flex justify-center mb-6">
            <div
              className={`
                flex items-center justify-center w-16 h-16 rounded-full
                ${isCorrect
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
                }
                animate-scale-in
              `}
            >
              {isCorrect ? (
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <X className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          <p className={`
            text-center text-xl font-serif mb-6 animate-fade-in
            ${isCorrect
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
            }
          `}>
            {isCorrect ? "正解！" : "不正解"}
          </p>
        </>
      )}

      {/* Card content */}
      <Card className="animate-fade-in-up mb-6">
        <CardContent className="pt-8 pb-6 px-8 space-y-5">
          {/* Question */}
          <div className="text-center pb-5 border-b border-border">
            <p className="text-base text-muted-foreground mb-3">問題</p>
            <div className="flex items-center justify-center gap-3">
              <p className={`font-serif text-3xl ${
                question.mode === "en-to-ja" ? "font-mono" : ""
              }`}>
                {questionText}
              </p>
              {question.mode === "en-to-ja" && speechAvailable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 shrink-0 text-muted-foreground hover:text-primary"
                  onClick={handleSpeak}
                  aria-label="発音を聞く"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Answer */}
          <div className="text-center">
            <p className="text-base text-muted-foreground mb-3">答え</p>
            <div className="flex items-center justify-center gap-3">
              <p className={`font-serif text-2xl font-medium ${
                question.mode === "ja-to-en" ? "font-mono" : ""
              }`}>
                {answerText}
              </p>
              {question.mode === "ja-to-en" && speechAvailable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0 text-muted-foreground hover:text-primary"
                  onClick={handleSpeak}
                  aria-label="発音を聞く"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Show user's wrong answer (choice mode only) */}
          {!isRecallMode && !isCorrect && (
            <div className="pt-4 border-t border-border">
              <p className="text-base text-muted-foreground mb-2 text-center">あなたの回答</p>
              <p className={`text-center text-lg text-red-600 dark:text-red-400 ${
                question.mode === "ja-to-en" ? "font-mono" : ""
              }`}>
                {selectedAnswer}
              </p>
            </div>
          )}

          {/* Example sentence */}
          {question.vocabEntry.example && (
            <div className="pt-4 border-t border-border">
              <p className="text-base text-muted-foreground mb-2">例文</p>
              <p className="text-lg italic text-muted-foreground">
                {question.vocabEntry.example}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SRS Rating Buttons */}
      <div className="grid grid-cols-4 gap-3">
        {ratings.map((rating, index) => (
          <button
            key={rating}
            onClick={() => onRate(rating)}
            className="flex flex-col items-center justify-center h-24 rounded-xl
              bg-card border border-border shadow-sm hover:shadow hover:border-primary/50 transition-all duration-200
              hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <span className={`text-lg font-medium ${
              rating === "again"
                ? "text-red-600 dark:text-red-400"
                : rating === "hard"
                ? "text-amber-600 dark:text-amber-400"
                : rating === "good"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-sky-600 dark:text-sky-400"
            }`}>
              {SRS_RATING_LABELS[rating]}
            </span>
            <span className="text-base text-muted-foreground mt-1">
              {intervalPreviews[rating]}
            </span>
            <kbd className="text-sm text-muted-foreground/50 font-mono mt-1">
              {index + 1}
            </kbd>
          </button>
        ))}
      </div>
    </div>
  );
}
