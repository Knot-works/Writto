export type Goal = "business" | "travel" | "study_abroad" | "daily" | "exam";
export type Level = "beginner" | "intermediate" | "advanced";
export type WritingMode = "goal" | "hobby" | "expression" | "custom";
export type VocabType = "word" | "expression";
export type Plan = "free" | "pro";
export type ExplanationLang = "ja" | "en";
export type UserType = "student" | "working";
export type SchoolType = "junior_high" | "high_school" | "university" | "graduate";

export type Rank =
  | "S"
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D";

export const RANK_ORDER: Rank[] = [
  "S",
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D",
];

// Score values for each rank (0-1000 scale)
export const RANK_SCORES: Record<Rank, number> = {
  S: 1000,
  "A+": 950,
  A: 900,
  "A-": 850,
  "B+": 800,
  B: 750,
  "B-": 700,
  "C+": 650,
  C: 600,
  "C-": 550,
  D: 500,
};

// Skill axis weights for overall score calculation
export const SKILL_WEIGHTS = {
  grammar: 0.3,
  vocabulary: 0.25,
  structure: 0.25,
  content: 0.2,
} as const;

export type SkillAxis = keyof typeof SKILL_WEIGHTS;

export const SKILL_LABELS: Record<SkillAxis, string> = {
  grammar: "文法",
  vocabulary: "語彙",
  structure: "構成",
  content: "内容",
};

// User's writing skill scores (rank-based)
export interface WritingSkillScore {
  overallRank: Rank;
  grammarRank: Rank;
  vocabularyRank: Rank;
  structureRank: Rank;
  contentRank: Rank;
  totalWritings: number;
  currentStreak: number;
  trend: "up" | "down" | "stable";
  lastUpdated: Date;
}

export function getRankColor(rank: Rank): string {
  if (rank === "S") return "rank-s";
  if (rank.startsWith("A")) return "rank-a";
  if (rank.startsWith("B")) return "rank-b";
  if (rank.startsWith("C")) return "rank-c";
  return "rank-d";
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  goal: Goal;
  level: Level;
  toeicScore?: number;
  interests: string[];
  customInterests?: string[];  // 自由入力の興味（バンド名、作品名など）
  targetExpressions: string[];
  explanationLang: ExplanationLang;
  plan: Plan;
  createdAt: Date;
  // Personalization fields (all optional for backward compat)
  userType?: UserType;
  schoolType?: SchoolType;
  grade?: number;
  clubActivity?: string;
  major?: string;
  occupation?: string;
  personalContext?: string;
  // Token usage (stored inline for easy access)
  tokenUsage?: TokenUsage;
}

export interface WritingFeedback {
  overallRank: Rank;
  grammarRank: Rank;
  vocabularyRank: Rank;
  structureRank: Rank;
  contentRank: Rank;
  summary?: string;
  improvements: Improvement[];
  vocabularyItems?: VocabularyItem[];
  modelAnswer: string;
}

export interface Improvement {
  original: string;
  suggested: string;
  explanation: string;
  type: "grammar" | "vocabulary" | "structure" | "content";
}

export interface VocabularyItem {
  term: string;
  meaning: string;
  type: "word" | "expression";
}

export interface Writing {
  id: string;
  userId: string;
  mode: WritingMode;
  prompt: string;
  promptHint?: string;
  recommendedWords?: number;
  userAnswer: string;
  feedback: WritingFeedback;
  wordCount: number;
  createdAt: Date;
  retriedFrom?: string;
}

export interface VocabEntry {
  id: string;
  userId: string;
  type: VocabType;
  term: string;
  meaning: string;
  example: string;
  tags: string[];
  source?: string;
  reviewCount: number;
  lastReviewedAt?: Date;
  createdAt: Date;
}

export interface UserStats {
  totalWritings: number;
  currentStreak: number;
  bestStreak: number;
  rankHistory: { date: string; rank: Rank }[];
  weakPoints: {
    grammar: number;
    vocabulary: number;
    structure: number;
    content: number;
  };
}

export const GOAL_LABELS: Record<Goal, string> = {
  business: "ビジネス",
  travel: "旅行",
  study_abroad: "留学",
  daily: "日常会話",
  exam: "試験対策",
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  beginner: "英検4〜3級 / TOEIC 〜400 / 中学英語レベル",
  intermediate: "英検準2〜2級 / TOEIC 400〜700 / 高校英語レベル",
  advanced: "英検準1級〜 / TOEIC 700〜 / ビジネスレベル",
};

export const MODE_LABELS: Record<WritingMode, string> = {
  goal: "目標特化",
  hobby: "趣味・興味",
  expression: "表現リクエスト",
  custom: "カスタムお題",
};

export interface DailyUsage {
  gradeWriting: number;
  generatePrompt: number;
  lookupWord: number;
}

// Token-based usage tracking (monthly)
export interface TokenUsage {
  tokensUsed: number;           // Total tokens used this period
  periodStart: Date;            // Start of current billing period
  periodEnd: Date;              // End of current billing period
  lastUpdated: Date;            // Last time usage was updated
}

export const INTEREST_OPTIONS = [
  "テクノロジー",
  "映画・ドラマ",
  "音楽",
  "スポーツ",
  "料理・グルメ",
  "旅行",
  "読書",
  "ゲーム",
  "アート・デザイン",
  "ビジネス・経済",
  "科学",
  "健康・フィットネス",
  "ファッション",
  "環境・SDGs",
  "教育",
];

export const USER_TYPE_LABELS: Record<UserType, string> = {
  student: "学生",
  working: "社会人",
};

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  junior_high: "中学校",
  high_school: "高校",
  university: "大学",
  graduate: "大学院",
};

export const GRADE_OPTIONS: Record<SchoolType, { value: number; label: string }[]> = {
  junior_high: [
    { value: 1, label: "1年生" },
    { value: 2, label: "2年生" },
    { value: 3, label: "3年生" },
  ],
  high_school: [
    { value: 1, label: "1年生" },
    { value: 2, label: "2年生" },
    { value: 3, label: "3年生" },
  ],
  university: [
    { value: 1, label: "1年生" },
    { value: 2, label: "2年生" },
    { value: 3, label: "3年生" },
    { value: 4, label: "4年生" },
  ],
  graduate: [
    { value: 1, label: "修士1年" },
    { value: 2, label: "修士2年" },
    { value: 3, label: "博士1年" },
    { value: 4, label: "博士2年" },
    { value: 5, label: "博士3年" },
  ],
};

export const OCCUPATION_OPTIONS = [
  "IT・エンジニア",
  "営業・マーケティング",
  "経理・財務",
  "人事・総務",
  "企画・経営",
  "デザイナー",
  "医療・看護",
  "教育・研究",
  "法務・コンサルティング",
  "製造・技術",
  "接客・サービス",
  "公務員",
  "フリーランス",
  "その他",
] as const;

// Chat message for follow-up questions
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: {
    type: "improvement";
    improvementIndex: number;
    original: string;
    suggested: string;
  };
}

// Learning point extracted from feedback
export interface LearningPoint {
  id: string;
  term: string;
  meaning: string;
  type: VocabType;
  source: "improvement" | "model_answer";
  improvementIndex?: number;
}

// Helper to classify vocab type
export function classifyVocabType(term: string): VocabType {
  const trimmed = term.trim();
  const words = trimmed.split(/\s+/);

  // Single word → word
  if (words.length === 1) return "word";

  // Multiple words → expression
  return "expression";
}
