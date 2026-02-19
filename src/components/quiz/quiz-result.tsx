import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  RotateCcw,
  BookOpen,
  Clock,
  Target,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { QuizResult as QuizResultType } from "@/types/quiz";

interface QuizResultProps {
  result: QuizResultType;
  onRetry: () => void;
}

export function QuizResult({ result, onRetry }: QuizResultProps) {
  const isPerfect = result.accuracy === 100;
  const isGreat = result.accuracy >= 80;
  const isGood = result.accuracy >= 60;

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  // Get result message
  const getResultMessage = () => {
    if (isPerfect) return "パーフェクト！";
    if (isGreat) return "すばらしい！";
    if (isGood) return "よくできました！";
    return "もう一度挑戦しよう！";
  };

  // Get result color
  const getResultColor = () => {
    if (isPerfect) return "text-amber-500";
    if (isGreat) return "text-emerald-600 dark:text-emerald-400";
    if (isGood) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      {/* Result header */}
      <div className="text-center mb-8">
        <div className={`
          inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
          ${isPerfect
            ? "bg-amber-100 dark:bg-amber-900/30"
            : isGreat
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-primary/10"
          }
          animate-scale-in
        `}>
          {isPerfect ? (
            <Trophy className="h-10 w-10 text-amber-500" />
          ) : isGreat ? (
            <Sparkles className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Target className="h-10 w-10 text-primary" />
          )}
        </div>
        <h1 className={`font-serif text-3xl mb-2 ${getResultColor()}`}>
          {getResultMessage()}
        </h1>
        <p className="text-muted-foreground">
          クイズが終了しました
        </p>
      </div>

      {/* Score card */}
      <Card className="mb-6 animate-fade-in-up">
        <CardContent className="pt-6 pb-5 px-6">
          {/* Main score */}
          <div className="text-center pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2">正答率</p>
            <p className={`font-serif text-6xl ${getResultColor()}`}>
              {result.accuracy}
              <span className="text-2xl">%</span>
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                <Target className="h-4 w-4" />
                <span className="font-serif text-xl">{result.correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">正解</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-red-500 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="font-serif text-xl">{result.incorrectCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">不正解</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-serif text-xl">{formatDuration(result.duration)}</span>
              </div>
              <p className="text-xs text-muted-foreground">所要時間</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mistakes list */}
      {result.mistakes.length > 0 && (
        <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="pt-5 pb-4 px-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">間違えた単語</h2>
              <Badge variant="secondary" className="ml-auto">
                {result.mistakes.length}件
              </Badge>
            </div>
            <div className="space-y-3">
              {result.mistakes.map((mistake, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm truncate">
                      {mistake.question.vocabEntry.term}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {mistake.question.vocabEntry.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <Button
          onClick={onRetry}
          className="flex-1 h-12 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          もう一度
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex-1 h-12 gap-2"
        >
          <Link to="/vocabulary">
            <BookOpen className="h-4 w-4" />
            単語帳に戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
