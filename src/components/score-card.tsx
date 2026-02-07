import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Flame, PenLine } from "lucide-react";
import { type WritingSkillScore, SKILL_LABELS, type SkillAxis, type Rank } from "@/types";
import { getRankGradient, getRankColorClass } from "@/lib/score";

interface ScoreCardProps {
  score: WritingSkillScore;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const trendIcon = useMemo(() => {
    switch (score.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-rose-500" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  }, [score.trend]);

  const gradientColor = useMemo(() => getRankGradient(score.overallRank), [score.overallRank]);

  const skillData: { key: SkillAxis; rank: Rank }[] = [
    { key: "grammar", rank: score.grammarRank },
    { key: "vocabulary", rank: score.vocabularyRank },
    { key: "structure", rank: score.structureRank },
    { key: "content", rank: score.contentRank },
  ];

  if (score.totalWritings === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <PenLine className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700">スコアを計算中...</h3>
          <p className="mt-1 text-sm text-slate-500">
            ライティングを完了するとスコアが表示されます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header with overall rank */}
      <div className={`bg-gradient-to-r ${gradientColor} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">総合評価</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-6xl font-bold tracking-tight">
                {score.overallRank}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            {trendIcon}
            <span className="text-xs font-medium">
              {score.trend === "up" && "上昇中"}
              {score.trend === "down" && "下降中"}
              {score.trend === "stable" && "安定"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{score.currentStreak}</p>
            <p className="text-xs text-slate-500">連続日数</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <PenLine className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{score.totalWritings}</p>
            <p className="text-xs text-slate-500">累計回数</p>
          </div>
        </div>
      </div>

      {/* Skill breakdown with ranks */}
      <div className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          スキル内訳
        </p>
        <div className="grid grid-cols-4 gap-3">
          {skillData.map(({ key, rank }) => (
            <SkillRankCard
              key={key}
              label={SKILL_LABELS[key]}
              rank={rank}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkillRankCardProps {
  label: string;
  rank: Rank;
}

function SkillRankCard({ label, rank }: SkillRankCardProps) {
  const colorClass = getRankColorClass(rank);

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className={`mt-1 font-serif text-2xl font-bold ${colorClass}`}>
        {rank}
      </p>
    </div>
  );
}
