import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import { useUpgradeModal } from "@/contexts/upgrade-modal-context";
import { useTypeLabels } from "@/lib/translations";
import { getWritings } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankBadge } from "@/components/writing/rank-badge";
import {
  PenLine,
  RefreshCw,
  Eye,
  Calendar,
  Crown,
  Info,
} from "lucide-react";
import type { Writing, WritingMode } from "@/types";

// 無料プランの履歴保持日数
const FREE_PLAN_HISTORY_DAYS = 7;

export default function HistoryPage() {
  const { t, i18n } = useTranslation("app");
  const { getModeLabel } = useTypeLabels();
  const { user, profile } = useAuth();
  const { open: openUpgradeModal } = useUpgradeModal();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | WritingMode>("all");

  const isFreePlan = profile?.plan !== "pro";
  const locale = i18n.language === "ko" ? "ko-KR" : "ja-JP";

  useEffect(() => {
    if (!user) return;
    getWritings(user.uid, 50)
      .then((w) => {
        setWritings(w);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: check localStorage
        const localWritings: Writing[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("writing-local-")) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || "");
              localWritings.push({
                ...parsed,
                createdAt: new Date(parsed.createdAt),
              });
            } catch {
              // skip invalid entries
            }
          }
        }
        localWritings.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        setWritings(localWritings);
        setLoading(false);
      });
  }, [user]);

  // 無料プランは7日間のみ表示
  const visibleWritings = useMemo(() => {
    if (!isFreePlan) return writings;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - FREE_PLAN_HISTORY_DAYS);
    return writings.filter((w) => w.createdAt >= cutoffDate);
  }, [writings, isFreePlan]);

  // 非表示になった履歴の数
  const hiddenCount = writings.length - visibleWritings.length;

  const filtered =
    filterMode === "all"
      ? visibleWritings
      : visibleWritings.filter((w) => w.mode === filterMode);

  // Group by month
  const grouped = filtered.reduce<Record<string, Writing[]>>((acc, w) => {
    const year = w.createdAt.getFullYear();
    const month = w.createdAt.getMonth() + 1;
    const key = t("history.group.monthYear", { year, month });
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl">{t("history.title")}</h1>
        <p className="text-muted-foreground">
          {t("history.subtitle")}
        </p>
      </div>

      {/* Free Plan Limitation Banner */}
      {isFreePlan && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t("history.freePlanBanner.limit", { days: FREE_PLAN_HISTORY_DAYS })}
                {hiddenCount > 0 && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    {t("history.freePlanBanner.hiddenCount", { count: hiddenCount })}
                  </span>
                )}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
              onClick={openUpgradeModal}
            >
              <Crown className="h-3.5 w-3.5" />
              {t("history.freePlanBanner.upgradeLink")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Tabs
        value={filterMode}
        onValueChange={(v) => setFilterMode(v as "all" | WritingMode)}
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">{t("history.filters.all")}</TabsTrigger>
          <TabsTrigger value="goal">{t("history.filters.goal")}</TabsTrigger>
          <TabsTrigger value="hobby">{t("history.filters.hobby")}</TabsTrigger>
          <TabsTrigger value="expression">{t("history.filters.expression")}</TabsTrigger>
          <TabsTrigger value="custom">{t("history.filters.custom")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <PenLine className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">
                {filterMode === "all"
                  ? t("history.empty.title")
                  : t("history.emptyFiltered", { mode: getModeLabel(filterMode as WritingMode) })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("history.empty.description")}
              </p>
            </div>
            <Button asChild>
              <Link to="/write">{t("history.empty.startWriting")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {month}
                <Badge variant="secondary" className="ml-1">
                  {t("history.group.count", { count: items.length })}
                </Badge>
              </div>
              <div className="space-y-2">
                {items.map((w) => (
                  <Card
                    key={w.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <RankBadge rank={w.feedback.overallRank} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{w.prompt}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {getModeLabel(w.mode)}
                          </Badge>
                          <span>{t("history.wordCount", { count: w.wordCount })}</span>
                          <span>・</span>
                          <span>
                            {w.createdAt.toLocaleDateString(locale, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to={`/write/result/${w.id}`}
                            className="gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {t("history.actions.viewResult")}
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to={`/write/${w.mode}`}
                            className="gap-1.5"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            {t("history.actions.retry")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
