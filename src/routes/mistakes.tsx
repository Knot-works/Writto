import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { getMistakes, archiveMistake, unarchiveMistake } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Check,
  FileText,
  Archive,
  RotateCcw,
  PenLine,
  BarChart3,
} from "lucide-react";
import {
  type MistakeEntry,
  type AnalysisPeriod,
  SUBTYPE_LABELS,
} from "@/types";

const PERIOD_LABELS: Record<AnalysisPeriod, string> = {
  "7d": "7日間",
  "30d": "30日間",
  "3m": "3ヶ月",
  all: "全期間",
};

const TYPE_LABELS = {
  all: "すべて",
  grammar: "文法",
  vocabulary: "語彙",
  structure: "構成",
  content: "内容",
};

const TYPE_COLORS = {
  grammar: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  vocabulary: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  structure: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  content: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

export default function MistakesPage() {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<AnalysisPeriod>("30d");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getMistakes(user.uid, {
          period,
          includeArchived: showArchived,
        });
        setMistakes(data);
      } catch (err) {
        console.error("Failed to load mistakes:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, period, showArchived]);

  const handleArchive = async (mistakeId: string) => {
    if (!user) return;
    try {
      await archiveMistake(user.uid, mistakeId);
      setMistakes((prev) =>
        prev.map((m) =>
          m.id === mistakeId ? { ...m, isArchived: true } : m
        )
      );
    } catch (err) {
      console.error("Failed to archive mistake:", err);
    }
  };

  const handleUnarchive = async (mistakeId: string) => {
    if (!user) return;
    try {
      await unarchiveMistake(user.uid, mistakeId);
      setMistakes((prev) =>
        prev.map((m) =>
          m.id === mistakeId ? { ...m, isArchived: false } : m
        )
      );
    } catch (err) {
      console.error("Failed to unarchive mistake:", err);
    }
  };

  // Filter by type
  const filtered = useMemo(() => {
    let result = mistakes;
    if (typeFilter !== "all") {
      result = result.filter((m) => m.type === typeFilter);
    }
    if (!showArchived) {
      result = result.filter((m) => !m.isArchived);
    }
    return result;
  }, [mistakes, typeFilter, showArchived]);

  // Stats by type
  const stats = useMemo(() => {
    const activeMistakes = mistakes.filter((m) => !m.isArchived);
    return {
      grammar: activeMistakes.filter((m) => m.type === "grammar").length,
      vocabulary: activeMistakes.filter((m) => m.type === "vocabulary").length,
      structure: activeMistakes.filter((m) => m.type === "structure").length,
      content: activeMistakes.filter((m) => m.type === "content").length,
      total: activeMistakes.length,
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
          <h1 className="font-serif text-3xl">間違いノート</h1>
          <p className="text-muted-foreground">
            過去の添削から抽出された改善ポイント
          </p>
        </div>
        <Button asChild>
          <Link to="/write" className="gap-2">
            <PenLine className="h-4 w-4" />
            練習する
          </Link>
        </Button>
      </div>

      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">期間:</span>
        {(Object.keys(PERIOD_LABELS) as AnalysisPeriod[]).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {PERIOD_LABELS[p]}
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
                    {TYPE_LABELS[type]}
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
              すべて ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="grammar">
              文法 ({stats.grammar})
            </TabsTrigger>
            <TabsTrigger value="vocabulary">
              語彙 ({stats.vocabulary})
            </TabsTrigger>
            <TabsTrigger value="structure">
              構成 ({stats.structure})
            </TabsTrigger>
            <TabsTrigger value="content">
              内容 ({stats.content})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-3.5 w-3.5" />
          {showArchived ? "アーカイブ非表示" : "アーカイブ表示"}
        </Button>
      </div>

      {/* Mistakes List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">
                {mistakes.length === 0
                  ? "まだ間違いが記録されていません"
                  : "該当する間違いがありません"}
              </p>
              <p className="text-sm text-muted-foreground">
                {mistakes.length === 0
                  ? "ライティングを添削すると、改善ポイントがここに蓄積されます"
                  : "フィルターを変更してみてください"}
              </p>
            </div>
            {mistakes.length === 0 && (
              <Button asChild>
                <Link to="/write" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  最初の練習をする
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((mistake) => (
            <Card
              key={mistake.id}
              className={`transition-all ${
                mistake.isArchived ? "opacity-50" : ""
              }`}
            >
              <CardContent className="p-4">
                {/* Header: Type + SubType + Action */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={TYPE_COLORS[mistake.type]}
                    >
                      {TYPE_LABELS[mistake.type]}
                    </Badge>
                    {mistake.subType && (
                      <span className="text-xs text-muted-foreground">
                        {SUBTYPE_LABELS[mistake.subType] || mistake.subType}
                      </span>
                    )}
                  </div>
                  {mistake.isArchived ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground"
                      onClick={() => handleUnarchive(mistake.id)}
                    >
                      <RotateCcw className="h-3 w-3" />
                      復元
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/5"
                      onClick={() => handleArchive(mistake.id)}
                    >
                      <Check className="h-3 w-3" />
                      克服した
                    </Button>
                  )}
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
                    {mistake.createdAt.toLocaleDateString("ja-JP")}
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
                  {PERIOD_LABELS[period]}の傾向
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.grammar > stats.vocabulary &&
                  stats.grammar > stats.structure &&
                  stats.grammar > stats.content
                    ? "文法の間違いが多めです。冠詞や時制に注意しましょう。"
                    : stats.vocabulary > stats.structure &&
                      stats.vocabulary > stats.content
                    ? "語彙の選択に課題があります。類義語の使い分けを意識しましょう。"
                    : stats.structure > stats.content
                    ? "文章構成に改善の余地があります。接続詞の使い方を練習しましょう。"
                    : stats.content > 0
                    ? "内容面での改善ポイントがあります。具体例を増やしましょう。"
                    : "良いペースで学習が進んでいます！"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
