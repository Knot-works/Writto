import { useState, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import { useToken } from "@/contexts/token-context";
import { useUpgradeModal } from "@/contexts/upgrade-modal-context";
import { useGrading } from "@/contexts/grading-context";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useTypeLabels } from "@/lib/translations";
import { callGeneratePrompt, isRateLimitError } from "@/lib/functions";
import { Analytics } from "@/lib/firebase";
import { getEstimatedRemaining } from "@/lib/rate-limits";
import { toast } from "sonner";
import { DictionaryPanel } from "@/components/writing/dictionary-panel";

// Lazy load OcrInput to avoid loading pdfjs-dist (~1.3MB) until needed
const OcrInput = lazy(() => import("@/components/writing/ocr-input").then(m => ({ default: m.OcrInput })));
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  RefreshCw,
  Lightbulb,
  ArrowLeft,
  Loader2,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Tag,
  Camera,
  Keyboard,
  Crown,
  Lock,
  Search,
  AlertCircle,
} from "lucide-react";
import type { WritingMode } from "@/types";

export default function WritingPage() {
  const { t } = useTranslation("app");
  const { getModeLabel } = useTypeLabels();
  const { user, profile } = useAuth();
  const { tokenUsage } = useToken();
  const { open: openUpgradeModal } = useUpgradeModal();
  const { startGrading } = useGrading();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode: modeParam } = useParams<{ mode: string }>();
  const mode = modeParam as WritingMode;

  // Accept daily prompt from dashboard navigation state
  const dailyPrompt = (location.state as { dailyPrompt?: { prompt: string; hint: string; recommendedWords: number; exampleJa?: string } })?.dailyPrompt;

  const [prompt, setPrompt] = useState(dailyPrompt?.prompt || "");
  const [hint, setHint] = useState(dailyPrompt?.hint || "");
  const [recommendedWords, setRecommendedWords] = useState(dailyPrompt?.recommendedWords || 80);
  const [exampleJa, setExampleJa] = useState(dailyPrompt?.exampleJa || "");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showExample, setShowExample] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [hobbyTopic, setHobbyTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dictOpen, setDictOpen] = useState(true);
  const [inputMode, setInputMode] = useState<"typing" | "ocr">("typing");
  const [dictSearchTrigger, setDictSearchTrigger] = useState<{ word: string; timestamp: number } | undefined>();

  // Ref-based guards to prevent race conditions on rapid clicks
  const isGeneratingRef = useRef(false);
  const rateLimitHitRef = useRef(false);

  // State for submitting to trigger re-render and disable unsaved changes warning
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate remaining gradings based on token budget
  const tokensRemaining = tokenUsage ? tokenUsage.tokenLimit - tokenUsage.tokensUsed : 0;
  const gradingRemaining = tokenUsage ? getEstimatedRemaining(tokensRemaining, "gradeWriting") : 999;
  const gradingLimitReached = gradingRemaining <= 0;

  const wordCount = userAnswer.trim()
    ? userAnswer.trim().split(/\s+/).length
    : 0;

  // Warn user when navigating away with unsaved content
  const hasUnsavedContent = userAnswer.trim().length > 0 && !isSubmitting;
  const { UnsavedChangesDialog } = useUnsavedChanges({
    hasUnsavedChanges: hasUnsavedContent,
    message: t("writing.mode.unsavedWarning"),
  });

  const generatePrompt = useCallback(async (topicOverride?: string) => {
    if (!profile || isGeneratingRef.current || rateLimitHitRef.current) return;
    isGeneratingRef.current = true;
    setGenerating(true);
    setShowExample(false);
    try {
      // For expression mode, always pass the customInput (expression to practice)
      // For hobby mode with topic override, pass the topicOverride
      // For other modes, pass topicOverride if provided
      const inputToPass = mode === "expression" ? customInput : topicOverride;
      const result = await callGeneratePrompt(profile, mode, inputToPass, profile.uiLanguage);
      setPrompt(result.prompt);
      setHint(result.hint);
      setRecommendedWords(result.recommendedWords);
      setExampleJa(result.exampleJa || "");
      setKeywords(result.keywords || []);
      Analytics.promptGenerated(mode);
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      Analytics.errorOccurred({ type: "prompt_generation", message: String(error), location: "generatePrompt" });
      if (isRateLimitError(error)) {
        rateLimitHitRef.current = true;
        toast.custom(
          () => (
            <div className="w-[360px] rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-amber-900">
                    {t("writing.mode.rateLimitReached")}
                  </p>
                  <p className="mt-1 text-sm text-amber-700/80">
                    {t("writing.mode.upgradePrompt")}
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
        openUpgradeModal();
      } else {
        toast.error(t("writing.mode.promptGenerationFailed"));
      }
    } finally {
      isGeneratingRef.current = false;
      setGenerating(false);
    }
  }, [profile, mode, customInput, openUpgradeModal]);

  useEffect(() => {
    if (profile && mode !== "custom" && mode !== "expression" && !dailyPrompt) {
      generatePrompt();
    }
  }, [profile, mode, generatePrompt, dailyPrompt]);

  const handleCustomSubmit = async () => {
    if (!customInput.trim() || !profile || isGeneratingRef.current || rateLimitHitRef.current) return;
    isGeneratingRef.current = true;
    setGenerating(true);
    setShowExample(false);
    try {
      const result = await callGeneratePrompt(profile, mode, customInput, profile.uiLanguage);
      setPrompt(result.prompt);
      setHint(result.hint);
      setRecommendedWords(result.recommendedWords);
      setExampleJa(result.exampleJa || "");
      setKeywords(result.keywords || []);
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      if (isRateLimitError(error)) {
        rateLimitHitRef.current = true;
        toast.custom(
          () => (
            <div className="w-[360px] rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-amber-900">
                    {t("writing.mode.rateLimitReached")}
                  </p>
                  <p className="mt-1 text-sm text-amber-700/80">
                    {t("writing.mode.upgradePrompt")}
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
        openUpgradeModal();
      } else {
        toast.error(t("writing.mode.promptGenerationFailed"));
      }
    } finally {
      isGeneratingRef.current = false;
      setGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!user || !profile || !userAnswer.trim() || !prompt || isSubmitting || rateLimitHitRef.current) return;

    // Start grading in background (non-blocking)
    startGrading({
      userId: user.uid,
      profile,
      mode,
      prompt,
      promptHint: hint,
      recommendedWords,
      userAnswer,
      wordCount,
    });

    // Set submitting state to disable unsaved changes warning, then navigate
    setIsSubmitting(true);
  };

  // Navigate after isSubmitting state change to ensure warning is disabled
  useEffect(() => {
    if (isSubmitting) {
      navigate("/write/result/pending");
    }
  }, [isSubmitting, navigate]);

  return (
    <div className="flex gap-6">
      {/* Main Writing Area */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t("common.back")}
          </Button>
          <div className="flex-1">
            <h1 className="font-serif text-2xl">{getModeLabel(mode)}</h1>
          </div>
          {/* Dictionary toggle (mobile + collapsed) */}
          {!dictOpen && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setDictOpen(true)}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t("writing.mode.dictionary")}</span>
            </Button>
          )}
        </div>

        {/* Custom/Expression Input */}
        {(mode === "custom" || mode === "expression") && !prompt && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="font-medium">
                {mode === "expression"
                  ? t("writing.mode.expressionInputLabel")
                  : t("writing.mode.customInputLabel")}
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder={
                    mode === "expression"
                      ? t("writing.mode.expressionPlaceholder")
                      : t("writing.mode.customPlaceholder")
                  }
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleCustomSubmit()}
                  maxLength={500}
                />
                <Button
                  onClick={handleCustomSubmit}
                  disabled={!customInput.trim() || generating}
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.submit")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prompt Display */}
        {(prompt || generating) && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {t("writing.mode.prompt")}
                  </span>
                </div>
                {mode !== "custom" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generatePrompt()}
                    disabled={generating}
                    className="gap-1.5"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`}
                    />
                    {t("writing.mode.differentPrompt")}
                  </Button>
                )}
              </div>

              {generating ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("writing.mode.generatingPrompt")}
                </div>
              ) : (
                <>
                  <p className="font-serif text-xl leading-relaxed">
                    {prompt}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary">
                      {t("writing.mode.recommendedWords", { count: recommendedWords })}
                    </Badge>
                    {hint && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span className="italic">{hint}</span>
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  {keywords.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        <span>{t("writing.mode.usefulExpressions")}:</span>
                      </div>
                      {keywords.map((keyword, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDictOpen(true);
                            setDictSearchTrigger({ word: keyword, timestamp: Date.now() });
                          }}
                          className="group relative rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                          title={t("writing.mode.clickToSearch")}
                        >
                          <span className="flex items-center gap-1">
                            {keyword}
                            <Search className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Japanese Example Toggle */}
                  {exampleJa && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowExample(!showExample)}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>{showExample ? t("writing.mode.hideExample") : t("writing.mode.showExample")}</span>
                        {showExample ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {showExample && (
                        <div className="mt-2 rounded-lg border border-border/40 bg-muted/30 p-4">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            {t("writing.mode.referenceExample")}
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                            {exampleJa}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hobby Topic Customization */}
                  {mode === "hobby" && (
                    <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {t("writing.mode.hobbyTopicLabel")}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("writing.mode.hobbyTopicPlaceholder")}
                          value={hobbyTopic}
                          onChange={(e) => setHobbyTopic(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            !e.nativeEvent.isComposing &&
                            hobbyTopic.trim() &&
                            generatePrompt(hobbyTopic)
                          }
                          maxLength={500}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0 text-xs"
                          onClick={() => generatePrompt(hobbyTopic)}
                          disabled={generating || !hobbyTopic.trim()}
                        >
                          {t("common.generate")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Writing Area */}
        {prompt && (
          <div className="space-y-3">
            {/* Header with Input Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="font-medium">{t("writing.mode.yourAnswer")}</p>
                {/* Input mode toggle - Available for all, Pro feature */}
                <div className="flex rounded-lg bg-muted/60 p-0.5">
                  <button
                    onClick={() => setInputMode("typing")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      inputMode === "typing"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Keyboard className="h-3 w-3" />
                    {t("writing.mode.inputTyping")}
                  </button>
                  <button
                    onClick={() => {
                      if (tokenUsage?.plan === "pro") {
                        setInputMode("ocr");
                      } else {
                        toast.custom(
                          (toastId) => (
                            <div className="w-[360px] rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                  <Crown className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-amber-900">
                                    {t("writing.mode.ocrProOnly")}
                                  </p>
                                  <p className="mt-1 text-sm text-amber-700/80">
                                    {t("writing.mode.ocrUpgradeDescription")}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  toast.dismiss(toastId);
                                  openUpgradeModal();
                                }}
                                className="mt-3 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-amber-600 hover:to-orange-600"
                              >
                                {t("common.learnMore")}
                              </button>
                            </div>
                          ),
                          { duration: 5000 }
                        );
                      }
                    }}
                    className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      inputMode === "ocr"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Camera className="h-3 w-3" />
                    {t("writing.mode.inputOcr")}
                    {tokenUsage?.plan !== "pro" && (
                      <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/10">
                        <Lock className="h-2.5 w-2.5 text-amber-600" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {inputMode === "typing" && (
                <span
                  className={`text-sm ${
                    wordCount >= recommendedWords
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("writing.mode.wordCount", { count: wordCount, recommended: recommendedWords })}
                </span>
              )}
            </div>

            {/* OCR Input Mode */}
            {inputMode === "ocr" ? (
              <Card>
                <CardContent className="p-6">
                  <Suspense fallback={
                    <div className="flex flex-col items-center gap-4 py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                      <p className="text-sm text-muted-foreground">{t("writing.mode.ocrLoading")}</p>
                    </div>
                  }>
                    <OcrInput
                      onComplete={(text) => {
                        setUserAnswer(text);
                        setInputMode("typing");
                        toast.success(t("writing.mode.ocrSuccess"));
                      }}
                      onCancel={() => setInputMode("typing")}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Typing Input Mode */}
                <div className="writing-area rounded-xl">
                  <Textarea
                    placeholder={t("writing.mode.answerPlaceholder")}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={12}
                    maxLength={5000}
                    className="min-h-[300px] resize-none border-border/60 bg-card text-base leading-relaxed focus-visible:ring-primary"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button
                    onClick={gradingLimitReached ? openUpgradeModal : handleSubmit}
                    disabled={wordCount < 5}
                    className="gap-2 px-8 btn-bounce"
                    size="lg"
                  >
                    <Send className="h-4 w-4" />
                    {t("writing.mode.submitForGrading")}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Dictionary Side Panel — desktop: sticky side column, mobile: slide-over */}
      {dictOpen && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setDictOpen(false)}
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
            <DictionaryPanel
              onClose={() => setDictOpen(false)}
              searchTrigger={dictSearchTrigger}
            />
          </aside>
        </>
      )}

      {/* Unsaved changes confirmation dialog */}
      <UnsavedChangesDialog />
    </div>
  );
}
