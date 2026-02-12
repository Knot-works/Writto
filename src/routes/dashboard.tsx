import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { getWritings, getUserStats, getDailyPromptsFromCache } from "@/lib/firestore";
import { callGetDailyPrompts, type DailyPrompts } from "@/lib/functions";
import { calculateWritingSkillScore } from "@/lib/score";
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
import { type Writing, type UserStats, type WritingMode, MODE_LABELS } from "@/types";

const DAILY_MODES: { key: keyof DailyPrompts; mode: WritingMode; label: string }[] = [
  { key: "goal", mode: "goal", label: "目標特化" },
  { key: "hobby", mode: "hobby", label: "趣味・興味" },
];

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyPrompts, setDailyPrompts] = useState<DailyPrompts | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof DailyPrompts>("goal");
  const [allWritings, setAllWritings] = useState<Writing[]>([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

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
    if (user && !dailyPrompts && !promptLoading) {
      setPromptLoading(true);
      // Try Firestore cache first (free), then Cloud Function (generates if needed)
      getDailyPromptsFromCache()
        .then((cached) => {
          if (cached) {
            setDailyPrompts(cached);
            setPromptLoading(false);
          } else {
            return callGetDailyPrompts().then((result) => {
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
  }, [user, dailyPrompts, promptLoading]);

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
          おかえりなさい、{profile?.displayName?.split(" ")[0]}さん
        </h1>
      </div>

      {/* Profile Completion Banner */}
      {!profile?.userType && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="flex items-center gap-4 p-4">
            <UserCircle className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                プロフィールをもっと教えてください
              </p>
              <p className="text-xs text-muted-foreground">
                職業や学校の情報を追加すると、より身近なお題が出せます
              </p>
            </div>
            <Link to="/settings">
              <Button size="sm" variant="outline">
                設定へ
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
                  <p className="text-sm font-medium text-primary">今日のお題</p>
                </div>
                <div className="relative flex gap-1 rounded-lg bg-muted/60 p-0.5 self-start">
                  {DAILY_MODES.map(({ key, label }) => (
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
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {promptLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>お題を読み込み中...</span>
                </div>
              ) : dailyPrompts ? (
                <>
                  <p className="font-serif text-lg sm:text-xl leading-relaxed break-words">
                    {dailyPrompts[activeTab].prompt}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <Badge variant="secondary" className="font-normal">
                      推奨: {dailyPrompts[activeTab].recommendedWords}語
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
                  お題を取得できませんでした。ライティング画面から始めてみましょう。
                </p>
              )}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link
                  to={`/write/${DAILY_MODES.find((m) => m.key === activeTab)!.mode}`}
                  state={dailyPrompts ? { dailyPrompt: dailyPrompts[activeTab] } : undefined}
                >
                  <Button className="gap-2">
                    <PenLine className="h-4 w-4" />
                    この問題を解く
                  </Button>
                </Link>
                <Link to="/write">
                  <Button variant="outline">別のモードを選ぶ</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Writings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">最近の学習</h2>
          <Link to="/history">
            <Button variant="ghost" size="sm">すべて見る</Button>
          </Link>
        </div>

        {writings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <PenLine className="h-12 w-12 text-muted-foreground/30" />
              <div className="text-center">
                <p className="font-medium">まだ学習記録がありません</p>
                <p className="text-sm text-muted-foreground">
                  最初のお題に挑戦してみましょう
                </p>
              </div>
              <Link to="/write">
                <Button>ライティングを始める</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {writings.map((w) => (
              <Card key={w.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <RankBadge rank={w.feedback.overallRank} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{w.prompt}</p>
                    <p className="text-sm text-muted-foreground">
                      {MODE_LABELS[w.mode]} ・{" "}
                      {w.createdAt.toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/write/result/${w.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        結果
                      </Button>
                    </Link>
                    <Link to={`/write/${w.mode}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        再挑戦
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
