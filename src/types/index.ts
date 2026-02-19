export type Goal = "business" | "travel" | "study_abroad" | "daily" | "exam";
export type Level = "beginner" | "intermediate" | "advanced" | "native";
export type WritingMode = "goal" | "hobby" | "expression" | "custom" | "business" | "daily" | "social";
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

// Structure analysis types
export type StructureRole =
  | "opinion"      // 意見・主張
  | "reason"       // 理由
  | "example"      // 具体例・詳細説明
  | "counter"      // 反論・対比
  | "conclusion";  // 結論

export const STRUCTURE_ROLE_LABELS: Record<StructureRole, string> = {
  opinion: "意見",
  reason: "理由",
  example: "例示",
  counter: "反論",
  conclusion: "結論",
};

export const STRUCTURE_ROLE_COLORS: Record<StructureRole, { bg: string; border: string; text: string }> = {
  opinion: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600" },
  reason: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-600" },
  example: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" },
  counter: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-600" },
  conclusion: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-600" },
};

export interface StructureBlock {
  role: StructureRole;
  text: string;           // The actual text from user's answer
  sentenceIndices: number[]; // Which sentences belong to this block
}

export interface StructureAnalysis {
  blocks: StructureBlock[];
  missingElements: StructureRole[];  // Roles that are missing
  feedback?: string;                  // Overall structure feedback
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
  structureAnalysis?: StructureAnalysis;  // New: structure analysis
  modelAnswer: string;
}

export interface Improvement {
  original: string;
  suggested: string;
  explanation: string;
  type: "grammar" | "vocabulary" | "structure" | "content";
  subType?: string;
}

// SubType categories for detailed error analysis
export const GRAMMAR_SUBTYPES = [
  "articles",      // 冠詞 (a/the)
  "tense",         // 時制
  "agreement",     // 主語と動詞の一致
  "prepositions",  // 前置詞
  "word_order",    // 語順
  "plurals",       // 複数形
  "modals",        // 助動詞
  "conditionals",  // 条件文
  "other_grammar", // その他
] as const;

export const VOCABULARY_SUBTYPES = [
  "word_choice",   // 語彙選択
  "collocation",   // コロケーション
  "formality",     // フォーマル度
  "spelling",      // スペル
  "other_vocab",   // その他
] as const;

export const STRUCTURE_SUBTYPES = [
  "missing_intro",      // 導入不足
  "missing_conclusion", // 結論不足
  "transitions",        // 接続詞
  "paragraph",          // 段落構成
  "other_structure",    // その他
] as const;

export const CONTENT_SUBTYPES = [
  "off_topic",           // 的外れ
  "insufficient_detail", // 詳細不足
  "unclear",             // 不明瞭
  "other_content",       // その他
] as const;

export const SUBTYPE_LABELS: Record<string, string> = {
  // Grammar
  articles: "冠詞 (a/the)",
  tense: "時制",
  agreement: "主語と動詞の一致",
  prepositions: "前置詞",
  word_order: "語順",
  plurals: "複数形",
  modals: "助動詞",
  conditionals: "条件文",
  other_grammar: "その他の文法",
  // Vocabulary
  word_choice: "語彙選択",
  collocation: "コロケーション",
  formality: "フォーマル度",
  spelling: "スペル",
  other_vocab: "その他の語彙",
  // Structure
  missing_intro: "導入不足",
  missing_conclusion: "結論不足",
  transitions: "接続詞・つなぎ",
  paragraph: "段落構成",
  other_structure: "その他の構成",
  // Content
  off_topic: "的外れ",
  insufficient_detail: "詳細不足",
  unclear: "不明瞭",
  other_content: "その他の内容",
};

// Mistake entry for the mistake journal
export interface MistakeEntry {
  id: string;
  original: string;
  suggested: string;
  explanation: string;
  type: "grammar" | "vocabulary" | "structure" | "content";
  subType: string;
  sourceWritingId: string;
  sourcePrompt: string;
  createdAt: Date;
}

// Period filter type
export type AnalysisPeriod = "7d" | "30d" | "3m" | "all";

export interface VocabularyItem {
  term: string;
  meaning: string;
  type: "word" | "expression";
}

export interface Writing {
  id: string;
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
  type: VocabType;
  term: string;
  meaning: string;
  example: string;
  source?: string;
  deckId?: string;        // Associated deck ID (null = default "My Vocabulary")
  reviewCount: number;
  lastReviewedAt?: Date;
  createdAt: Date;
  // SRS (Spaced Repetition System) fields
  easeFactor?: number;    // Difficulty factor (default 2.5, min 1.3)
  interval?: number;      // Days until next review (default 1)
  nextReviewAt?: Date;    // Next scheduled review date
}

// Vocabulary Deck
export interface VocabDeck {
  id: string;
  name: string;
  description?: string;
  theme?: string;         // Theme used for AI generation
  category?: string;      // Category (business, it, etc.)
  level?: Level;          // Difficulty level
  vocabCount: number;     // Cached vocabulary count
  createdAt: Date;
  updatedAt: Date;
}

// SRS difficulty rating
export type SRSRating = "again" | "hard" | "good" | "easy";

export const SRS_RATING_LABELS: Record<SRSRating, string> = {
  again: "もう一度",
  hard: "難しい",
  good: "正解",
  easy: "簡単",
};

export interface UserStats {
  totalWritings: number;
  currentStreak: number;
  bestStreak: number;
  lastWritingDate?: string;
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
  native: "ネイティブ",
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  beginner: "英検4〜3級 / TOEIC 〜400 / 中学英語レベル",
  intermediate: "英検準2〜2級 / TOEIC 400〜700 / 高校英語レベル",
  advanced: "英検準1級〜 / TOEIC 700〜 / ビジネスレベル",
  native: "英検1級〜 / TOEIC 900〜 / ネイティブレベル",
};

export const MODE_LABELS: Record<WritingMode, string> = {
  goal: "目標特化",
  hobby: "趣味・興味",
  expression: "表現リクエスト",
  custom: "カスタムお題",
  business: "ビジネス",
  daily: "日常",
  social: "社会問題",
};

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
    type: "improvement" | "selection";
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
