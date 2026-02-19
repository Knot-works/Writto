import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getVocabulary, updateVocabReview } from "@/lib/firestore";
import { calculateSRS } from "@/lib/srs";
import { QuizStart, QuizQuestion, QuizRecall, QuizFeedback, QuizResult } from "@/components/quiz";
import type { VocabEntry, SRSRating } from "@/types";
import type {
  QuizMode,
  QuizInputMode,
  QuizSession,
  QuizStatus,
  QuizAnswer,
  QuizResult as QuizResultType,
  QuizQuestion as QuizQuestionType,
} from "@/types/quiz";
import {
  selectQuizQuestions,
  createQuizQuestions,
  calculateQuizResult,
  generateChoices,
} from "@/types/quiz";

const DEFAULT_QUESTION_COUNT = 10;
const STORAGE_KEY = "writto-quiz-prefs";

interface QuizPrefs {
  mode: QuizMode;
  inputMode: QuizInputMode;
  questionCount: number;
}

function loadQuizPrefs(): QuizPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        mode: parsed.mode || "en-to-ja",
        inputMode: parsed.inputMode || "choice",
        questionCount: parsed.questionCount || DEFAULT_QUESTION_COUNT,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { mode: "en-to-ja", inputMode: "choice", questionCount: DEFAULT_QUESTION_COUNT };
}

function saveQuizPrefs(prefs: QuizPrefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export default function VocabularyQuizPage() {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load preferences from localStorage
  const initialPrefs = loadQuizPrefs();
  const [mode, setMode] = useState<QuizMode>(initialPrefs.mode);
  const [inputMode, setInputMode] = useState<QuizInputMode>(initialPrefs.inputMode);
  const [questionCount, setQuestionCount] = useState<number>(initialPrefs.questionCount);

  // Save preferences when they change
  const handleModeChange = (newMode: QuizMode) => {
    setMode(newMode);
    saveQuizPrefs({ mode: newMode, inputMode, questionCount });
  };

  const handleInputModeChange = (newInputMode: QuizInputMode) => {
    setInputMode(newInputMode);
    saveQuizPrefs({ mode, inputMode: newInputMode, questionCount });
  };

  const handleQuestionCountChange = (newCount: number) => {
    setQuestionCount(newCount);
    saveQuizPrefs({ mode, inputMode, questionCount: newCount });
  };
  const [status, setStatus] = useState<QuizStatus>("ready");
  const [session, setSession] = useState<QuizSession | null>(null);
  const [lastAnswer, setLastAnswer] = useState<{
    selectedIndex: number;
    isCorrect: boolean;
  } | null>(null);
  const [result, setResult] = useState<QuizResultType | null>(null);

  // Load vocabulary
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const data = await getVocabulary(user.uid, 500);
        setVocabulary(data);
      } catch {
        // Fallback to localStorage
        const stored = localStorage.getItem("writto-vocab");
        if (stored) {
          const parsed = JSON.parse(stored);
          setVocabulary(
            parsed.map((e: Record<string, unknown>) => ({
              ...e,
              createdAt: new Date(e.createdAt as string),
              lastReviewedAt: e.lastReviewedAt
                ? new Date(e.lastReviewedAt as string)
                : undefined,
              nextReviewAt: e.nextReviewAt
                ? new Date(e.nextReviewAt as string)
                : undefined,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  // Start quiz
  const handleStart = useCallback(() => {
    const actualQuestionCount = Math.min(questionCount, vocabulary.length);
    const selected = selectQuizQuestions(vocabulary, actualQuestionCount);
    const questions = createQuizQuestions(selected, vocabulary, mode);

    setSession({
      questions,
      currentIndex: 0,
      answers: [],
      startedAt: new Date(),
    });
    setStatus("playing");
    setResult(null);
    setLastAnswer(null);
  }, [vocabulary, mode, questionCount]);

  // Handle answer (choice mode)
  const handleAnswer = useCallback((selectedIndex: number) => {
    if (!session) return;

    const currentQuestion = session.questions[session.currentIndex];
    const isCorrect = selectedIndex === currentQuestion.correctIndex;

    const answer: QuizAnswer = {
      questionIndex: session.currentIndex,
      selectedIndex,
      isCorrect,
      answeredAt: new Date(),
    };

    // Update session
    const newAnswers = [...session.answers, answer];
    setSession(prev => prev ? { ...prev, answers: newAnswers } : null);

    // Show feedback
    setLastAnswer({ selectedIndex, isCorrect });
    setStatus("feedback");
  }, [session]);

  // Handle reveal (recall mode)
  const handleReveal = useCallback(() => {
    if (!session) return;

    const currentQuestion = session.questions[session.currentIndex];

    // In recall mode, we don't know if the user got it right
    // We'll set isCorrect based on their SRS rating later
    // For now, use correctIndex as selectedIndex (to show correct answer)
    setLastAnswer({
      selectedIndex: currentQuestion.correctIndex,
      isCorrect: true, // Will be determined by SRS rating
    });
    setStatus("feedback");
  }, [session]);

  // Handle SRS rating
  const handleRate = useCallback(async (rating: SRSRating) => {
    if (!session || !user) return;

    const currentQuestion = session.questions[session.currentIndex];
    const vocabEntry = currentQuestion.vocabEntry;

    // For recall mode, record answer based on rating
    if (inputMode === "recall") {
      const isCorrect = rating !== "again";
      const answer: QuizAnswer = {
        questionIndex: session.currentIndex,
        selectedIndex: currentQuestion.correctIndex,
        isCorrect,
        answeredAt: new Date(),
      };
      const newAnswers = [...session.answers, answer];
      setSession(prev => prev ? { ...prev, answers: newAnswers } : null);
    }

    // Calculate SRS values
    const srsUpdate = calculateSRS(vocabEntry, rating);

    // Update vocab in Firestore
    try {
      await updateVocabReview(user.uid, vocabEntry.id, srsUpdate);

      // Update local vocabulary state
      setVocabulary(prev => prev.map(v =>
        v.id === vocabEntry.id
          ? {
              ...v,
              ...srsUpdate,
              lastReviewedAt: srsUpdate.lastReviewedAt,
            }
          : v
      ));
    } catch {
      // Silent fail - not critical
    }

    // Handle "again" - re-add to session
    if (rating === "again") {
      const { choices, correctIndex } = generateChoices(vocabEntry, vocabulary, mode);
      const newQuestion: QuizQuestionType = {
        vocabEntry,
        mode,
        choices,
        correctIndex,
      };

      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: [...prev.questions, newQuestion],
        };
      });
    }

    // Continue to next question
    const nextIndex = session.currentIndex + 1;
    const totalQuestions = rating === "again"
      ? session.questions.length + 1
      : session.questions.length;

    if (nextIndex >= totalQuestions) {
      // Quiz finished
      const finalSession = {
        ...session,
        answers: inputMode === "recall"
          ? [...session.answers, {
              questionIndex: session.currentIndex,
              selectedIndex: currentQuestion.correctIndex,
              isCorrect: rating !== "again",
              answeredAt: new Date(),
            }]
          : session.answers,
      };
      const quizResult = calculateQuizResult(finalSession);
      setResult(quizResult);
      setStatus("finished");
    } else {
      setSession(prev => prev ? { ...prev, currentIndex: nextIndex } : null);
      setStatus("playing");
      setLastAnswer(null);
    }
  }, [session, user, vocabulary, mode, inputMode]);

  // Retry quiz
  const handleRetry = useCallback(() => {
    setStatus("ready");
    setSession(null);
    setResult(null);
    setLastAnswer(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Wrapper for vertical centering
  const CenteredWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );

  // Ready state
  if (status === "ready") {
    return (
      <CenteredWrapper>
        <QuizStart
          vocabCount={vocabulary.length}
          questionCount={Math.min(questionCount, vocabulary.length)}
          mode={mode}
          inputMode={inputMode}
          onModeChange={handleModeChange}
          onInputModeChange={handleInputModeChange}
          onQuestionCountChange={handleQuestionCountChange}
          onStart={handleStart}
        />
      </CenteredWrapper>
    );
  }

  // Playing state
  if (status === "playing" && session) {
    if (inputMode === "recall") {
      return (
        <CenteredWrapper>
          <QuizRecall
            question={session.questions[session.currentIndex]}
            progress={session.currentIndex + 1}
            total={session.questions.length}
            onReveal={handleReveal}
          />
        </CenteredWrapper>
      );
    }
    return (
      <CenteredWrapper>
        <QuizQuestion
          question={session.questions[session.currentIndex]}
          progress={session.currentIndex + 1}
          total={session.questions.length}
          onAnswer={handleAnswer}
        />
      </CenteredWrapper>
    );
  }

  // Feedback state
  if (status === "feedback" && session && lastAnswer) {
    return (
      <CenteredWrapper>
        <QuizFeedback
          question={session.questions[session.currentIndex]}
          selectedIndex={lastAnswer.selectedIndex}
          isCorrect={lastAnswer.isCorrect}
          isRecallMode={inputMode === "recall"}
          onRate={handleRate}
        />
      </CenteredWrapper>
    );
  }

  // Finished state
  if (status === "finished" && result) {
    return (
      <CenteredWrapper>
        <QuizResult
          result={result}
          onRetry={handleRetry}
        />
      </CenteredWrapper>
    );
  }

  return null;
}
