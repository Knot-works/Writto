import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { getWritings, getUserStats, getDailyPromptsFromCache } from "@/lib/firestore";
import { callGetDailyPrompts, type DailyPrompts } from "@/lib/functions";
import { calculateWritingSkillScore } from "@/lib/score";
import { useTypeLabels } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RankBadge } from "@/components/writing/rank-badge";
import { ScoreCard } from "@/components/score-card";
import { FeedbackModal } from "@/components/feedback-modal";
import {
  PenLine,
  RefreshCw,
  Sparkles,
  Loader2,
  UserCircle,
  Eye,
  MessageSquare,
} from "lucide-react";
import type { Writing, UserStats, WritingMode } from "@/types";

const DAILY_MODE_KEYS: { key: keyof DailyPrompts; mode: WritingMode }[] = [
  { key: "goal", mode: "goal" },
  { key: "hobby", mode: "hobby" },
];

export default function DashboardPage() {
  const { t } = useTranslation("app");
  const { getModeLabel } = useTypeLabels();
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyPrompts, setDailyPrompts] = useState<DailyPrompts | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof DailyPrompts>("goal");
  const [allWritings, setAllWritings] = useState<Writing[]>([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [showFirstWritingTooltip, setShowFirstWritingTooltip] = useState(false);
  const [pendingTooltip, setPendingTooltip] = useState(false);

  // Check if coming from onboarding with first writing
  useEffect(() => {
    if (searchParams.get("firstWriting") === "true") {
      setPendingTooltip(true);
      // Remove param from URL without navigation
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Show tooltip after writings are loaded
  useEffect(() => {
    if (pendingTooltip && !loading && writings.length > 0) {
      setPendingTooltip(false);
      // Small delay for smooth animation after render
      const showTimer = setTimeout(() => {
        setShowFirstWritingTooltip(true);
      }, 300);
      // Auto-hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setShowFirstWritingTooltip(false);
      }, 4300);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [pendingTooltip, loading, writings.length]);

  useEffect(() => {
    if (user) {
      Promise.all([
        getWritings(user.uid, 5),
        getWritings(user.uid, 50), // Get more writings for score calculation
        getUserStats(user.uid),
      ]).then(([recent, all, s]) => {
        setWritings(recent);
        setAllWritings(all);
        setStats(s);
        setLoading(false);
      });
    }
  }, [user]);

  // Calculate skill score from all writings
  const skillScore = useMemo(() => {
    return calculateWritingSkillScore(allWritings, stats?.currentStreak || 0);
  }, [allWritings, stats?.currentStreak]);

  useEffect(() => {
    if (user && profile && !dailyPrompts && !promptLoading) {
      setPromptLoading(true);
      const lang = profile.uiLanguage ?? "ja";
      // Try Firestore cache first (free), then Cloud Function (generates if needed)
      getDailyPromptsFromCache(lang)
        .then((cached) => {
          if (cached) {
            setDailyPrompts(cached);
            setPromptLoading(false);
          } else {
            return callGetDailyPrompts(lang).then((result) => {
              setDailyPrompts(result);
              setPromptLoading(false);
            });
          }
        })
        .catch((err) => {
          console.error("Failed to get daily prompts:", err);
          setPromptLoading(false);
        });
    }
  }, [user, profile, dailyPrompts, promptLoading]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl">
          {t("dashboard.welcome", { name: profile?.displayName?.split(" ")[0] })}
        </h1>
      </div>

      {/* Profile Completion Banner */}
      {!profile?.userType && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="flex items-center gap-4 p-4">
            <UserCircle className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {t("dashboard.profileBanner.title")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.profileBanner.description")}
              </p>
            </div>
            <Link to="/settings">
              <Button size="sm" variant="outline">
                {t("navigation.settings")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Writing Skill Score */}
      <ScoreCard score={skillScore} />

      {/* Today's Prompt Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.03] overflow-hidden">
        <CardContent className="p-4 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary sm:hidden" />
                  <p className="text-sm font-medium text-primary">{t("dashboard.dailyPrompt.title")}</p>
                </div>
                <div className="relative flex gap-1 rounded-lg bg-muted/60 p-0.5 self-start">
                  {DAILY_MODE_KEYS.map(({ key, mode }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`relative z-10 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        activeTab === key
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {activeTab === key && (
                        <motion.span
                          layoutId="daily-tab-indicator"
                          className="absolute inset-0 rounded-md bg-card shadow-sm"
                          style={{ zIndex: -1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      {getModeLabel(mode)}
                    </button>
                  ))}
                </div>
              </div>
              {promptLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("dashboard.dailyPrompt.loading")}</span>
                </div>
              ) : dailyPrompts ? (
                <>
                  <p className="font-serif text-lg sm:text-xl leading-relaxed break-words">
                    {dailyPrompts[activeTab].prompt}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <Badge variant="secondary" className="font-normal">
                      {t("dashboard.dailyPrompt.recommendedWords", { count: dailyPrompts[activeTab].recommendedWords })}
                    </Badge>
                    {dailyPrompts[activeTab].hint && (
                      <span className="text-sm italic text-muted-foreground">
                        {dailyPrompts[activeTab].hint}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  {t("dashboard.dailyPrompt.error")}
                </p>
              )}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link
                  to={`/write/${DAILY_MODE_KEYS.find((m) => m.key === activeTab)!.mode}`}
                  state={dailyPrompts ? { dailyPrompt: dailyPrompts[activeTab] } : undefined}
                >
                  <Button className="gap-2">
                    <PenLine className="h-4 w-4" />
                    {t("dashboard.actions.startSameMode")}
                  </Button>
                </Link>
                <Link to="/write">
                  <Button variant="outline">{t("dashboard.modes.selectAnother")}</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Writings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{t("dashboard.recentLearning.title")}</h2>
          <Link to="/history">
            <Button variant="ghost" size="sm">{t("dashboard.recentLearning.viewAll")}</Button>
          </Link>
        </div>

        {writings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <PenLine className="h-12 w-12 text-muted-foreground/30" />
              <div className="text-center">
                <p className="font-medium">{t("dashboard.recentLearning.empty")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.recentLearning.emptyDescription")}
                </p>
              </div>
              <Link to="/write">
                <Button>{t("dashboard.recentLearning.startWriting")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {writings.map((w, index) => (
              <Card key={w.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <RankBadge rank={w.feedback.overallRank} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{w.prompt}</p>
                    <p className="text-sm text-muted-foreground">
                      {getModeLabel(w.mode)} ・{" "}
                      {w.createdAt.toLocaleDateString(profile?.uiLanguage === "ko" ? "ko-KR" : "ja-JP")}
                    </p>
                  </div>
                  <div className="relative flex gap-1">
                    {/* First writing tooltip */}
                    <AnimatePresence>
                      {index === 0 && showFirstWritingTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="absolute -top-14 right-0 z-50 whitespace-nowrap"
                        >
                          <div className="relative rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
                            <Sparkles className="inline h-3.5 w-3.5 mr-1.5" />
                            {t("dashboard.firstWritingTooltip")}
                            {/* Arrow */}
                            <div className="absolute -bottom-2 right-6 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Link to={`/write/result/${w.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {t("dashboard.actions.viewResult")}
                      </Button>
                    </Link>
                    <Link to={`/write/${w.mode}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        {t("dashboard.actions.retry")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Feedback Button */}
      <button
        onClick={() => setFeedbackModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
      />
    </div>
  );
}
