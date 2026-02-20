import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Sparkles, ArrowLeft, Grid2X2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { QuizMode, QuizInputMode } from "@/types/quiz";

interface QuizStartProps {
  vocabCount: number;
  questionCount: number;
  mode: QuizMode;
  inputMode: QuizInputMode;
  onModeChange: (mode: QuizMode) => void;
  onInputModeChange: (mode: QuizInputMode) => void;
  onQuestionCountChange: (count: number) => void;
  onStart: () => void;
}

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const;

export function QuizStart({
  vocabCount,
  questionCount,
  mode,
  inputMode,
  onModeChange,
  onInputModeChange,
  onQuestionCountChange,
  onStart,
}: QuizStartProps) {
  const { t } = useTranslation("app");
  const canStart = inputMode === "recall" ? vocabCount >= 1 : vocabCount >= 4;

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      {/* Back link */}
      <div className="w-full max-w-md mb-4">
        <Link
          to="/vocabulary"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("quiz.backToVocabulary")}
        </Link>
      </div>

      {/* Main card */}
      <Card className="w-full max-w-md">
        <CardContent className="pt-7 pb-6 px-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-3">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-serif text-2xl mb-1">{t("quiz.start.title")}</h1>
            <p className="text-muted-foreground">
              {t("quiz.start.description")}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-serif text-2xl">{vocabCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("quiz.start.registeredWords")}</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="font-serif text-2xl">{questionCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("quiz.start.questionCount")}</p>
            </div>
          </div>

          {/* Input mode selection */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-2.5 text-center">{t("quiz.start.inputMode")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onInputModeChange("choice")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                  inputMode === "choice"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Grid2X2 className={`h-4 w-4 ${inputMode === "choice" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${inputMode === "choice" ? "text-primary" : ""}`}>{t("quiz.inputModes.choice")}</span>
                </div>
              </button>
              <button
                onClick={() => onInputModeChange("recall")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                  inputMode === "recall"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className={`h-4 w-4 ${inputMode === "recall" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${inputMode === "recall" ? "text-primary" : ""}`}>{t("quiz.inputModes.recall")}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mode selection */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-2.5 text-center">{t("quiz.start.quizMode")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onModeChange("en-to-ja")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                  mode === "en-to-ja"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-sm font-medium">{t("quiz.modes.enToJa")}</div>
              </button>
              <button
                onClick={() => onModeChange("ja-to-en")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                  mode === "ja-to-en"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-sm font-medium">{t("quiz.modes.jaToEn")}</div>
              </button>
            </div>
          </div>

          {/* Question count selection */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2.5 text-center">{t("quiz.start.questionCount")}</p>
            <div className="flex gap-2 justify-center">
              {QUESTION_COUNT_OPTIONS.map((count) => {
                const isDisabled = count > vocabCount;
                return (
                  <button
                    key={count}
                    onClick={() => !isDisabled && onQuestionCountChange(count)}
                    disabled={isDisabled}
                    className={`
                      w-14 h-10 rounded-lg border-2 text-sm font-medium transition-all duration-200
                      ${isDisabled
                        ? "opacity-40 cursor-not-allowed border-border/40"
                        : questionCount === count
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start button or warning */}
          {canStart ? (
            <Button
              onClick={onStart}
              className="w-full h-11 gap-2"
            >
              <Play className="h-4 w-4" />
              {t("quiz.start.startButton")}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                  {t("quiz.start.minWordsRequired")}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-0.5">
                  {t("quiz.start.wordsNeeded", { count: 4 - vocabCount })}
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/vocabulary">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t("quiz.start.addWords")}
                </Link>
              </Button>
            </div>
          )}

          {/* Info badges */}
          {canStart && (
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary" className="text-xs">
                {inputMode === "choice" ? t("quiz.badges.choiceQuiz") : t("quiz.badges.freeRecall")}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {t("quiz.badges.reviewPriority")}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
