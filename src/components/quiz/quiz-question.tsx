import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { speakEnglish, isSpeechAvailable, stopSpeech } from "@/lib/speech";
import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";

interface QuizQuestionProps {
  question: QuizQuestionType;
  progress: number;
  total: number;
  onAnswer: (selectedIndex: number) => void;
}

export function QuizQuestion({
  question,
  progress,
  total,
  onAnswer,
}: QuizQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);

  useEffect(() => {
    setSpeechAvailable(isSpeechAvailable());
    return () => stopSpeech();
  }, []);

  const handleSpeak = () => {
    if (question.mode === "en-to-ja") {
      speakEnglish(question.vocabEntry.term);
    }
  };

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return; // Already answered
    if (index >= question.choices.length) return; // Invalid index
    setSelectedIndex(index);

    // Small delay before moving to feedback
    setTimeout(() => {
      onAnswer(index);
      setSelectedIndex(null);
    }, 150);
  };

  // Keyboard shortcuts (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex !== null) return; // Already answered
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyMap: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };
      const index = keyMap[e.key];
      if (index !== undefined && index < question.choices.length) {
        handleSelect(index);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, question.choices.length]);

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
        <CardContent className="pt-10 pb-8 px-8 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            {questionLabel}
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className={`font-serif text-4xl ${
              question.mode === "en-to-ja" ? "font-mono" : ""
            }`}>
              {questionText}
            </p>
            {/* Speaker button for English text */}
            {question.mode === "en-to-ja" && speechAvailable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 shrink-0 text-muted-foreground hover:text-primary"
                onClick={handleSpeak}
                aria-label="発音を聞く"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            )}
          </div>
          {/* Show example if available and mode is en-to-ja */}
          {question.mode === "en-to-ja" && question.vocabEntry.example && (
            <p className="text-lg text-muted-foreground mt-5 italic">
              {question.vocabEntry.example}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Choices */}
      <div className="grid gap-3">
        {question.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={selectedIndex !== null}
            className={`
              w-full p-5 rounded-xl border-2 text-left transition-all duration-200
              ${selectedIndex === index
                ? "border-primary bg-primary/10 scale-[0.98]"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
              ${selectedIndex !== null && selectedIndex !== index
                ? "opacity-50"
                : ""
              }
              disabled:cursor-default
              animate-fade-in
            `}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`
                flex items-center justify-center w-11 h-11 rounded-lg text-lg font-medium
                ${selectedIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                }
              `}>
                {index + 1}
              </div>
              <span className={`flex-1 text-xl ${
                question.mode === "ja-to-en" ? "font-mono" : ""
              }`}>
                {choice}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
