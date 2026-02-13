import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useGrading } from "@/contexts/grading-context";
import { useToken } from "@/contexts/token-context";
import { useUpgradeModal } from "@/contexts/upgrade-modal-context";
import { getWriting } from "@/lib/firestore";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RankBadge } from "@/components/writing/rank-badge";
import { ChatPanel } from "@/components/writing/chat-panel";
import { SentenceFeedback } from "@/components/writing/sentence-feedback";
import { StructureAnalysis } from "@/components/writing/structure-analysis";
import { LearningPoints } from "@/components/writing/learning-points";
import { SelectionPopover } from "@/components/ui/selection-popover";
import {
  ArrowLeft,
  BookOpen,
  PenLine,
  ArrowRight,
  Copy,
  Check,
  MessageCircle,
  FileText,
  Volume2,
  Square,
  Crown,
} from "lucide-react";
import {
  type Writing,
  type Improvement,
  MODE_LABELS,
} from "@/types";

export default function ResultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Grading context for pre-fetch flow
  const { status: gradingStatus, result: gradingResult, isRateLimit, reset: resetGrading } = useGrading();
  const { refresh: refreshTokenUsage } = useToken();
  const { open: openUpgradeModal } = useUpgradeModal();

  const [writing, setWriting] = useState<Writing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // Start closed on mobile
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Handle grading context for "pending" route
  const isPending = id === "pending";

  // When grading completes, update URL and set writing
  useEffect(() => {
    if (!isPending) return;

    if (gradingStatus === "success" && gradingResult) {
      // Grading completed - update URL without navigation (replace history)
      window.history.replaceState(null, "", `/write/result/${gradingResult.writingId}`);
      // Set the writing data from context
      setWriting({
        id: gradingResult.writingId,
        mode: gradingResult.mode,
        prompt: gradingResult.prompt,
        promptHint: gradingResult.promptHint,
        recommendedWords: gradingResult.recommendedWords,
        userAnswer: gradingResult.userAnswer,
        feedback: gradingResult.feedback,
        wordCount: gradingResult.wordCount,
        createdAt: new Date(),
      });
      setLoading(false);
      // Reset grading context for next use
      resetGrading();
    } else if (gradingStatus === "error") {
      // Grading failed - show error and redirect back
      if (isRateLimit) {
        refreshTokenUsage();
        toast.custom(
          () => (
            <div className="w-[360px] rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-amber-900">
                    無料枠を使い切りました
                  </p>
                  <p className="mt-1 text-sm text-amber-700/80">
                    Proプランで学習を続けましょう
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
        openUpgradeModal();
      } else {
        toast.error("添削に失敗しました");
      }
      resetGrading();
      navigate("/write", { replace: true });
    }
  }, [isPending, gradingStatus, gradingResult, isRateLimit, resetGrading, refreshTokenUsage, openUpgradeModal, navigate]);

  // Load writing from Firestore for direct URL access
  useEffect(() => {
    if (!user || !id || isPending) return;

    // Check localStorage fallback first (for MVP without Firebase)
    if (id.startsWith("local-")) {
      const stored = localStorage.getItem(`writing-${id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWriting({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
        });
      }
      setLoading(false);
      return;
    }

    getWriting(user.uid, id)
      .then((w) => {
        setWriting(w);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to localStorage
        const stored = localStorage.getItem(`writing-${id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setWriting({
            ...parsed,
            createdAt: new Date(parsed.createdAt),
          });
        }
        setLoading(false);
      });
  }, [user, id, isPending]);

  const handleCopyModelAnswer = () => {
    if (!writing?.feedback.modelAnswer) return;
    navigator.clipboard.writeText(writing.feedback.modelAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!writing?.feedback.modelAnswer) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(writing.feedback.modelAnswer);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Slightly slower for learning

    // Try to find a good English voice
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Female")
    ) || voices.find((v) => v.lang.startsWith("en-US"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  // Handle asking about a specific improvement
  const handleAskAboutImprovement = useCallback(
    (index: number, improvement: Improvement) => {
      // Open chat panel if closed
      setChatOpen(true);
      // Trigger the chat panel to ask about this improvement
      setTimeout(() => {
        const panel = document.getElementById("chat-panel") as HTMLElement & {
          askAboutImprovement?: (index: number, improvement: Improvement) => void;
        };
        panel?.askAboutImprovement?.(index, improvement);
      }, 100);
    },
    []
  );

  // Handle asking about selected text
  const handleAskAboutSelection = useCallback(
    (selectedText: string) => {
      // Open chat panel if closed
      setChatOpen(true);
      // Trigger the chat panel to ask about this selection
      setTimeout(() => {
        const panel = document.getElementById("chat-panel") as HTMLElement & {
          askAboutSelection?: (text: string) => void;
        };
        panel?.askAboutSelection?.(selectedText);
      }, 100);
    },
    []
  );

  // Show grading-in-progress UI for pending state
  if (isPending && gradingStatus === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="font-serif text-xl font-medium grading-pulse">
                添削中...
              </p>
              <p className="text-sm text-muted-foreground">
                AIがあなたの英文を分析しています
              </p>
            </div>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="skeleton h-8 w-24" />
          <div className="ml-auto skeleton h-4 w-32" />
        </div>

        {/* Score skeleton */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-6">
            <div className="skeleton h-20 w-20 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-6 w-32" />
              <div className="flex gap-3">
                <div className="skeleton h-10 w-14 rounded-lg" />
                <div className="skeleton h-10 w-14 rounded-lg" />
                <div className="skeleton h-10 w-14 rounded-lg" />
                <div className="skeleton h-10 w-14 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-6 w-40" />
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!writing) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          戻る
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="font-medium">結果が見つかりませんでした</p>
            <Button asChild>
              <Link to="/write">新しいお題に挑戦する</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { feedback } = writing;

  return (
    <div className="flex gap-6">
      {/* Main Content Area */}
      <div className="min-w-0 flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            ホームへ
          </Button>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <span>{MODE_LABELS[writing.mode]}</span>
            <span>・</span>
            <span>{writing.wordCount}語</span>
          </div>
          {/* Chat toggle */}
          {!chatOpen && (
            <Button
              size="sm"
              className="gap-1.5 bg-primary/90 hover:bg-primary shadow-md shadow-primary/20"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">質問する</span>
            </Button>
          )}
        </div>

        {/* Score Card - Compact */}
        <div className="animate-fade-in-up stagger-1">
          <Card className="border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              {/* Prompt */}
              <div className="border-b border-border/40 bg-muted/30 px-6 py-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-foreground/80">{writing.prompt}</p>
                </div>
              </div>

              {/* Ranks */}
              <div className="p-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <RankBadge rank={feedback.overallRank} size="lg" label="総合" />
                  <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                    <RankBadge rank={feedback.grammarRank} size="sm" label="文法" />
                    <RankBadge rank={feedback.vocabularyRank} size="sm" label="語彙" />
                    <RankBadge rank={feedback.structureRank} size="sm" label="構成" />
                    <RankBadge rank={feedback.contentRank} size="sm" label="内容" />
                  </div>
                </div>

                {/* Summary */}
                {feedback.summary && (
                  <div className="mt-5 rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-[15px] leading-relaxed text-foreground/80">
                      {feedback.summary}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sentence Feedback - Your answer with inline corrections */}
        <div className="animate-fade-in-up stagger-2">
          <SentenceFeedback
            userAnswer={writing.userAnswer}
            improvements={feedback.improvements}
            onAskAbout={handleAskAboutImprovement}
            onAskAboutSelection={handleAskAboutSelection}
          />
        </div>

        {/* Structure Analysis - Show text structure */}
        {feedback.structureAnalysis && (
          <div className="animate-fade-in-up stagger-3">
            <StructureAnalysis
              userAnswer={writing.userAnswer}
              structureAnalysis={feedback.structureAnalysis}
              onAskAboutSelection={handleAskAboutSelection}
            />
          </div>
        )}

        {/* Learning Points - Add to vocabulary */}
        <div className="animate-fade-in-up stagger-4">
          <LearningPoints
            vocabularyItems={feedback.vocabularyItems}
            sourcePrompt={writing.prompt}
          />
        </div>

        {/* Model Answer */}
        <div className="space-y-4 animate-fade-in-up stagger-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-serif text-lg font-medium">模範解答</h2>
          </div>

          <Card className="border-primary/10 bg-gradient-to-br from-primary/[0.02] to-transparent">
            <CardContent className="p-6 space-y-4">
              <SelectionPopover onAsk={handleAskAboutSelection}>
                <p className="whitespace-pre-wrap leading-[1.9] text-foreground/90 select-text">
                  {feedback.modelAnswer}
                </p>
              </SelectionPopover>
              <Separator className="bg-border/40" />
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleSpeak}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="h-3.5 w-3.5 text-primary" />
                      停止
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      読み上げ
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleCopyModelAnswer}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-primary" />
                      コピーしました
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      コピー
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Challenge CTA */}
        <div className="animate-fade-in-up stagger-6 pb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                  続けて練習すると効果的です
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate(`/write/${writing.mode}`)}
                  >
                    <PenLine className="h-4 w-4" />
                    同じモードで練習
                  </Button>
                  <Button
                    className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                    onClick={() => navigate("/write")}
                  >
                    次のお題に挑戦
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Side Panel */}
      {chatOpen && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setChatOpen(false)}
          />

          {/* Panel */}
          <aside
            className={[
              "z-50 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg",
              // Mobile: fixed slide-in from right
              "fixed inset-y-0 right-0 w-[340px] rounded-l-xl rounded-r-none lg:rounded-xl",
              // Desktop: sticky side column
              "lg:relative lg:inset-auto lg:w-[360px] lg:shrink-0 lg:shadow-none",
              "lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]",
            ].join(" ")}
          >
            <ChatPanel
              writingContext={{
                prompt: writing.prompt,
                userAnswer: writing.userAnswer,
                feedback: writing.feedback,
              }}
              onClose={() => setChatOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}
