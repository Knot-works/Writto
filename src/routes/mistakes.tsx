import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import { getMistakes, deleteMistake } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  FileText,
  PenLine,
  BarChart3,
} from "lucide-react";
import type { MistakeEntry, AnalysisPeriod } from "@/types";

const PERIOD_KEYS: AnalysisPeriod[] = ["7d", "30d", "3m", "all"];

const TYPE_COLORS = {
  grammar: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  vocabulary: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  structure: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  content: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

export default function MistakesPage() {
  const { t, i18n } = useTranslation("app");
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<AnalysisPeriod>("30d");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const locale = i18n.language === "ko" ? "ko-KR" : "ja-JP";

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getMistakes(user.uid, { period });
        setMistakes(data);
      } catch (err) {
        console.error("Failed to load mistakes:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, period]);

  const handleDelete = async (mistakeId: string) => {
    if (!user) return;
    try {
      await deleteMistake(user.uid, mistakeId);
      setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
      toast.success(t("mistakes.toast.overcomeSuccess"));
    } catch (err) {
      console.error("Failed to delete mistake:", err);
      toast.error(t("mistakes.toast.deleteFailed"));
    }
  };

  // Filter by type
  const filtered = useMemo(() => {
    if (typeFilter === "all") return mistakes;
    return mistakes.filter((m) => m.type === typeFilter);
  }, [mistakes, typeFilter]);

  // Stats by type
  const stats = useMemo(() => {
    return {
      grammar: mistakes.filter((m) => m.type === "grammar").length,
      vocabulary: mistakes.filter((m) => m.type === "vocabulary").length,
      structure: mistakes.filter((m) => m.type === "structure").length,
      content: mistakes.filter((m) => m.type === "content").length,
      total: mistakes.length,
    };
  }, [mistakes]);

  // Max for percentage calculation
  const maxCount = Math.max(
    stats.grammar,
    stats.vocabulary,
    stats.structure,
    stats.content,
    1
  );

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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl">{t("mistakes.title")}</h1>
          <p className="text-muted-foreground">
            {t("mistakes.subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link to="/write" className="gap-2">
            <PenLine className="h-4 w-4" />
            {t("mistakes.actions.practice")}
          </Link>
        </Button>
      </div>

      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("mistakes.periodFilter.label")}</span>
        {PERIOD_KEYS.map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {t(`mistakes.periodFilter.${p}`)}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["grammar", "vocabulary", "structure", "content"] as const).map(
          (type) => (
            <Card
              key={type}
              className={`cursor-pointer transition-all ${
                typeFilter === type
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:shadow-md"
              }`}
              onClick={() =>
                setTypeFilter(typeFilter === type ? "all" : type)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={TYPE_COLORS[type]}
                  >
                    {t(`mistakes.types.${type}`)}
                  </Badge>
                  <span className="font-serif text-xl font-bold">
                    {stats[type]}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      type === "grammar"
                        ? "bg-rose-500"
                        : type === "vocabulary"
                        ? "bg-amber-500"
                        : type === "structure"
                        ? "bg-sky-500"
                        : "bg-violet-500"
                    }`}
                    style={{
                      width: `${(stats[type] / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <TabsList>
            <TabsTrigger value="all">
              {t("mistakes.tabs.all", { count: stats.total })}
            </TabsTrigger>
            <TabsTrigger value="grammar">
              {t("mistakes.tabs.grammar", { count: stats.grammar })}
            </TabsTrigger>
            <TabsTrigger value="vocabulary">
              {t("mistakes.tabs.vocabulary", { count: stats.vocabulary })}
            </TabsTrigger>
            <TabsTrigger value="structure">
              {t("mistakes.tabs.structure", { count: stats.structure })}
            </TabsTrigger>
            <TabsTrigger value="content">
              {t("mistakes.tabs.content", { count: stats.content })}
            </TabsTrigger>
          </TabsList>
        </Tabs>

      </div>

      {/* Mistakes List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">
                {mistakes.length === 0
                  ? t("mistakes.empty.title")
                  : t("mistakes.emptyFiltered")}
              </p>
              <p className="text-sm text-muted-foreground">
                {mistakes.length === 0
                  ? t("mistakes.empty.description")
                  : t("mistakes.emptyFilteredDescription")}
              </p>
            </div>
            {mistakes.length === 0 && (
              <Button asChild>
                <Link to="/write" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  {t("mistakes.startPractice")}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((mistake) => (
            <Card key={mistake.id} className="transition-all">
              <CardContent className="p-4">
                {/* Header: Type + SubType + Action */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={TYPE_COLORS[mistake.type]}
                    >
                      {t(`mistakes.types.${mistake.type}`)}
                    </Badge>
                    {mistake.subType && (
                      <span className="text-xs text-muted-foreground">
                        {t(`types.subtypes.${mistake.subType}`, { defaultValue: mistake.subType })}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => handleDelete(mistake.id)}
                  >
                    <Check className="h-3 w-3" />
                    {t("mistakes.actions.overcome")}
                  </Button>
                </div>

                {/* Correction: Original → Suggested */}
                <div className="mb-3 space-y-1">
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {mistake.original}
                  </p>
                  <p className="text-sm text-muted-foreground">↓</p>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {mistake.suggested}
                  </p>
                </div>

                {/* Explanation */}
                <p className="text-[13px] leading-relaxed text-muted-foreground mb-3">
                  {mistake.explanation}
                </p>

                {/* Footer: Prompt + Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 border-t border-border/40 pt-3">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1 flex-1">
                    {mistake.sourcePrompt}
                  </span>
                  <span className="shrink-0">
                    {mistake.createdAt.toLocaleDateString(locale)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {stats.total > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t("mistakes.summary.title", { period: t(`mistakes.periodFilter.${period}`) })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.grammar > stats.vocabulary &&
                  stats.grammar > stats.structure &&
                  stats.grammar > stats.content
                    ? t("mistakes.summary.grammarFocus")
                    : stats.vocabulary > stats.structure &&
                      stats.vocabulary > stats.content
                    ? t("mistakes.summary.vocabularyFocus")
                    : stats.structure > stats.content
                    ? t("mistakes.summary.structureFocus")
                    : stats.content > 0
                    ? t("mistakes.summary.contentFocus")
                    : t("mistakes.summary.goodProgress")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
