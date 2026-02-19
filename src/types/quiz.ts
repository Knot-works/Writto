import type { VocabEntry } from "@/types";

// Quiz mode types
export type QuizMode = "en-to-ja" | "ja-to-en";

// Quiz input mode
export type QuizInputMode = "choice" | "recall";

// Quiz question
export interface QuizQuestion {
  vocabEntry: VocabEntry;
  mode: QuizMode;
  choices: string[];
  correctIndex: number;
}

// User's answer
export interface QuizAnswer {
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: Date;
}

// Quiz session state
export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizAnswer[];
  startedAt: Date;
}

// Quiz status
export type QuizStatus = "ready" | "playing" | "feedback" | "finished";

// Quiz result summary
export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  duration: number; // in seconds
  mistakes: {
    question: QuizQuestion;
    selectedAnswer: string;
  }[];
}

// Calculate priority score for spaced repetition
export function calculatePriority(entry: VocabEntry): number {
  const now = Date.now();
  const lastReview = entry.lastReviewedAt?.getTime() || 0;
  const daysSinceReview = lastReview
    ? (now - lastReview) / (1000 * 60 * 60 * 24)
    : 999; // Never reviewed = highest priority

  // Higher review count = lower priority (already learned)
  const reviewFactor = 1 / (entry.reviewCount + 1);

  // Add small random factor to prevent same order every time
  const randomFactor = Math.random() * 0.2;

  return daysSinceReview * reviewFactor + randomFactor;
}

// Select questions for a quiz session
export function selectQuizQuestions(
  vocabulary: VocabEntry[],
  count: number = 10
): VocabEntry[] {
  if (vocabulary.length === 0) return [];

  // Sort by priority (highest first)
  const sorted = [...vocabulary].sort(
    (a, b) => calculatePriority(b) - calculatePriority(a)
  );

  // Take top N entries
  return sorted.slice(0, Math.min(count, vocabulary.length));
}

// Shuffle array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate choices for a question
export function generateChoices(
  correct: VocabEntry,
  allVocab: VocabEntry[],
  mode: QuizMode
): { choices: string[]; correctIndex: number } {
  const correctAnswer = mode === "en-to-ja"
    ? correct.meaning
    : correct.term;

  // Get distractors from other vocabulary
  const distractors = allVocab
    .filter(v => v.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(v => mode === "en-to-ja" ? v.meaning : v.term);

  // If not enough distractors, we'll have fewer choices
  const allChoices = [correctAnswer, ...distractors];
  const shuffled = shuffle(allChoices);

  return {
    choices: shuffled,
    correctIndex: shuffled.indexOf(correctAnswer),
  };
}

// Create quiz questions from vocabulary
export function createQuizQuestions(
  selectedVocab: VocabEntry[],
  allVocab: VocabEntry[],
  mode: QuizMode = "en-to-ja"
): QuizQuestion[] {
  return selectedVocab.map(entry => {
    const { choices, correctIndex } = generateChoices(entry, allVocab, mode);
    return {
      vocabEntry: entry,
      mode,
      choices,
      correctIndex,
    };
  });
}

// Calculate quiz result
export function calculateQuizResult(
  session: QuizSession
): QuizResult {
  const correctCount = session.answers.filter(a => a.isCorrect).length;
  const incorrectCount = session.answers.length - correctCount;
  const accuracy = session.answers.length > 0
    ? Math.round((correctCount / session.answers.length) * 100)
    : 0;

  const endTime = session.answers.length > 0
    ? session.answers[session.answers.length - 1].answeredAt.getTime()
    : Date.now();
  const duration = Math.round((endTime - session.startedAt.getTime()) / 1000);

  const mistakes = session.answers
    .filter(a => !a.isCorrect)
    .map(a => ({
      question: session.questions[a.questionIndex],
      selectedAnswer: session.questions[a.questionIndex].choices[a.selectedIndex],
    }));

  return {
    totalQuestions: session.questions.length,
    correctCount,
    incorrectCount,
    accuracy,
    duration,
    mistakes,
  };
}
