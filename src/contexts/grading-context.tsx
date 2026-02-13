import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { callGradeWriting, isRateLimitError } from "@/lib/functions";
import { saveWriting, saveMistakes } from "@/lib/firestore";
import { Analytics } from "@/lib/firebase";
import type { UserProfile, WritingMode, WritingFeedback } from "@/types";

export type GradingStatus = "idle" | "loading" | "success" | "error";

export interface GradingRequest {
  userId: string;
  profile: UserProfile;
  mode: WritingMode;
  prompt: string;
  promptHint?: string;
  recommendedWords?: number;
  userAnswer: string;
  wordCount: number;
}

export interface GradingResult {
  writingId: string;
  feedback: WritingFeedback;
  // Include the original request data for display
  mode: WritingMode;
  prompt: string;
  promptHint?: string;
  recommendedWords?: number;
  userAnswer: string;
  wordCount: number;
}

interface GradingContextType {
  status: GradingStatus;
  result: GradingResult | null;
  error: Error | null;
  isRateLimit: boolean;
  startGrading: (request: GradingRequest) => void;
  reset: () => void;
}

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export function GradingProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GradingStatus>("idle");
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isRateLimit, setIsRateLimit] = useState(false);

  // Prevent duplicate calls
  const isGradingRef = useRef(false);

  const startGrading = useCallback((request: GradingRequest) => {
    if (isGradingRef.current) return;
    isGradingRef.current = true;

    // Reset state
    setStatus("loading");
    setResult(null);
    setError(null);
    setIsRateLimit(false);

    // Start API call (non-blocking)
    (async () => {
      try {
        // Call grading API
        const feedback = await callGradeWriting(
          request.profile,
          request.prompt,
          request.userAnswer,
          request.profile.explanationLang
        );

        // Save to Firestore
        const writingId = await saveWriting(request.userId, {
          mode: request.mode,
          prompt: request.prompt,
          promptHint: request.promptHint,
          recommendedWords: request.recommendedWords,
          userAnswer: request.userAnswer,
          feedback,
          wordCount: request.wordCount,
        });

        // Track analytics
        Analytics.writingSubmitted({ mode: request.mode, wordCount: request.wordCount, timeTakenSec: 0 });
        Analytics.writingGraded({ mode: request.mode, rank: feedback.overallRank });

        // Save mistakes (fire and forget)
        if (feedback.improvements && feedback.improvements.length > 0) {
          saveMistakes(request.userId, feedback.improvements, writingId, request.prompt).catch(
            (err) => console.error("Failed to save mistakes:", err)
          );
        }

        setResult({
          writingId,
          feedback,
          mode: request.mode,
          prompt: request.prompt,
          promptHint: request.promptHint,
          recommendedWords: request.recommendedWords,
          userAnswer: request.userAnswer,
          wordCount: request.wordCount,
        });
        setStatus("success");
      } catch (err) {
        console.error("Grading failed:", err);
        Analytics.errorOccurred({ type: "grading", message: String(err), location: "GradingContext" });

        setError(err instanceof Error ? err : new Error(String(err)));
        setIsRateLimit(isRateLimitError(err));
        setStatus("error");
      } finally {
        isGradingRef.current = false;
      }
    })();
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setIsRateLimit(false);
    isGradingRef.current = false;
  }, []);

  return (
    <GradingContext.Provider
      value={{ status, result, error, isRateLimit, startGrading, reset }}
    >
      {children}
    </GradingContext.Provider>
  );
}

export function useGrading() {
  const context = useContext(GradingContext);
  if (context === undefined) {
    throw new Error("useGrading must be used within a GradingProvider");
  }
  return context;
}
