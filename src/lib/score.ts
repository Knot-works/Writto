import {
  type Rank,
  type Writing,
  type WritingSkillScore,
  RANK_SCORES,
  SKILL_WEIGHTS,
} from "@/types";

/**
 * Convert a rank to its numeric score value
 */
export function rankToScore(rank: Rank): number {
  return RANK_SCORES[rank];
}

/**
 * Convert a numeric score to a rank
 */
export function scoreToRank(score: number): Rank {
  if (score >= 975) return "S";
  if (score >= 925) return "A+";
  if (score >= 875) return "A";
  if (score >= 825) return "A-";
  if (score >= 775) return "B+";
  if (score >= 725) return "B";
  if (score >= 675) return "B-";
  if (score >= 625) return "C+";
  if (score >= 575) return "C";
  if (score >= 525) return "C-";
  return "D";
}

/**
 * Calculate the weighted overall score from individual skill scores
 */
function calculateWeightedScore(skills: {
  grammar: number;
  vocabulary: number;
  structure: number;
  content: number;
}): number {
  return Math.round(
    skills.grammar * SKILL_WEIGHTS.grammar +
    skills.vocabulary * SKILL_WEIGHTS.vocabulary +
    skills.structure * SKILL_WEIGHTS.structure +
    skills.content * SKILL_WEIGHTS.content
  );
}

/**
 * Calculate writing skill scores from writing history
 * Uses exponential moving average to weight recent writings more heavily
 * Returns ranks instead of numeric scores
 */
export function calculateWritingSkillScore(
  writings: Writing[],
  currentStreak: number
): WritingSkillScore {
  if (writings.length === 0) {
    return {
      overallRank: "D",
      grammarRank: "D",
      vocabularyRank: "D",
      structureRank: "D",
      contentRank: "D",
      totalWritings: 0,
      currentStreak: 0,
      trend: "stable",
      lastUpdated: new Date(),
    };
  }

  // Sort by date descending (newest first)
  const sorted = [...writings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Use exponential moving average with decay factor
  // More recent writings have more weight
  const alpha = 0.3; // Decay factor (higher = more weight on recent)

  let grammarSum = 0;
  let vocabularySum = 0;
  let structureSum = 0;
  let contentSum = 0;
  let weightSum = 0;

  sorted.forEach((writing, index) => {
    const weight = Math.pow(1 - alpha, index);
    const feedback = writing.feedback;

    grammarSum += rankToScore(feedback.grammarRank) * weight;
    vocabularySum += rankToScore(feedback.vocabularyRank) * weight;
    structureSum += rankToScore(feedback.structureRank) * weight;
    contentSum += rankToScore(feedback.contentRank) * weight;
    weightSum += weight;
  });

  const grammarScore = Math.round(grammarSum / weightSum);
  const vocabularyScore = Math.round(vocabularySum / weightSum);
  const structureScore = Math.round(structureSum / weightSum);
  const contentScore = Math.round(contentSum / weightSum);
  const overallScore = calculateWeightedScore({
    grammar: grammarScore,
    vocabulary: vocabularyScore,
    structure: structureScore,
    content: contentScore,
  });

  // Calculate trend based on last 3 writings vs previous 3
  const trend = calculateTrend(sorted);

  return {
    overallRank: scoreToRank(overallScore),
    grammarRank: scoreToRank(grammarScore),
    vocabularyRank: scoreToRank(vocabularyScore),
    structureRank: scoreToRank(structureScore),
    contentRank: scoreToRank(contentScore),
    totalWritings: writings.length,
    currentStreak,
    trend,
    lastUpdated: new Date(),
  };
}

/**
 * Determine if scores are trending up, down, or stable
 */
function calculateTrend(
  sortedWritings: Writing[]
): "up" | "down" | "stable" {
  if (sortedWritings.length < 3) return "stable";

  const recentCount = Math.min(3, Math.floor(sortedWritings.length / 2));
  const recent = sortedWritings.slice(0, recentCount);
  const older = sortedWritings.slice(recentCount, recentCount * 2);

  if (older.length === 0) return "stable";

  const recentAvg = averageOverallScore(recent);
  const olderAvg = averageOverallScore(older);
  const diff = recentAvg - olderAvg;

  // Threshold of 30 points to consider a significant change
  if (diff > 30) return "up";
  if (diff < -30) return "down";
  return "stable";
}

function averageOverallScore(writings: Writing[]): number {
  if (writings.length === 0) return 0;
  const sum = writings.reduce(
    (acc, w) => acc + rankToScore(w.feedback.overallRank),
    0
  );
  return sum / writings.length;
}

/**
 * Get rank color class
 */
export function getRankColorClass(rank: Rank): string {
  if (rank === "S") return "text-amber-500";
  if (rank.startsWith("A")) return "text-amber-500";
  if (rank.startsWith("B")) return "text-emerald-500";
  if (rank.startsWith("C")) return "text-sky-500";
  return "text-slate-500";
}

/**
 * Get gradient color for rank
 */
export function getRankGradient(rank: Rank): string {
  if (rank === "S") return "from-amber-400 to-orange-500";
  if (rank.startsWith("A")) return "from-amber-400 to-orange-500";
  if (rank.startsWith("B")) return "from-emerald-400 to-teal-500";
  if (rank.startsWith("C")) return "from-sky-400 to-blue-500";
  return "from-slate-400 to-slate-500";
}
