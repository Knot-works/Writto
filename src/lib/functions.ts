import { getFunctions, httpsCallable } from "firebase/functions";
import app from "./firebase";
import type { UserProfile, WritingFeedback } from "@/types";

const functions = getFunctions(app, "asia-northeast1");

// ============ Types ============

interface PromptResponse {
  prompt: string;
  hint: string;
  recommendedWords: number;
  exampleJa?: string;
}

interface ProfileData {
  goal: string;
  level: string;
  toeicScore?: number;
  interests: string[];
  customInterests?: string[];
  targetExpressions: string[];
  explanationLang: string;
  userType?: string;
  schoolType?: string;
  grade?: number;
  clubActivity?: string;
  major?: string;
  occupation?: string;
  personalContext?: string;
}

function toProfileData(profile: UserProfile): ProfileData {
  return {
    goal: profile.goal,
    level: profile.level,
    toeicScore: profile.toeicScore,
    interests: profile.interests,
    targetExpressions: profile.targetExpressions,
    explanationLang: profile.explanationLang,
    ...(profile.customInterests && { customInterests: profile.customInterests }),
    ...(profile.userType && { userType: profile.userType }),
    ...(profile.schoolType && { schoolType: profile.schoolType }),
    ...(profile.grade && { grade: profile.grade }),
    ...(profile.clubActivity && { clubActivity: profile.clubActivity }),
    ...(profile.major && { major: profile.major }),
    ...(profile.occupation && { occupation: profile.occupation }),
    ...(profile.personalContext && { personalContext: profile.personalContext }),
  };
}

export interface LookupResult {
  term: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  examples: string[];
  related: string[];
}

export interface LookupResponse {
  results: LookupResult[];
}

export interface DailyPromptEntry {
  prompt: string;
  hint: string;
  recommendedWords: number;
  exampleJa?: string;
}

export interface DailyPrompts {
  goal: DailyPromptEntry;
  hobby: DailyPromptEntry;
}

// ============ API Calls ============

export async function callGeneratePrompt(
  profile: UserProfile,
  mode: string,
  customInput?: string
): Promise<PromptResponse> {
  const fn = httpsCallable<
    { profile: ProfileData; mode: string; customInput?: string },
    PromptResponse
  >(functions, "generatePrompt");

  const result = await fn({
    profile: toProfileData(profile),
    mode,
    customInput,
  });

  return result.data;
}

export async function callGradeWriting(
  profile: UserProfile,
  prompt: string,
  userAnswer: string,
  lang?: "ja" | "en"
): Promise<WritingFeedback> {
  const fn = httpsCallable<
    { profile: ProfileData; prompt: string; userAnswer: string; lang?: string },
    WritingFeedback
  >(functions, "gradeWriting");

  const result = await fn({
    profile: toProfileData(profile),
    prompt,
    userAnswer,
    lang: lang || "ja",
  });

  return result.data;
}

export async function callLookupWord(
  query: string,
  lang?: "ja" | "en"
): Promise<LookupResponse> {
  const fn = httpsCallable<
    { query: string; lang?: string },
    LookupResponse
  >(functions, "lookupWord");

  const result = await fn({ query, lang: lang || "ja" });
  return result.data;
}

// ============ Follow-up Chat ============

export interface AskFollowUpRequest {
  writingContext: {
    prompt: string;
    userAnswer: string;
    modelAnswer: string;
    improvements: Array<{
      original: string;
      suggested: string;
      explanation: string;
      type: string;
    }>;
  };
  question: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  improvementContext?: {
    index: number;
    original: string;
    suggested: string;
    explanation: string;
  };
  lang?: "ja" | "en";
}

export interface AskFollowUpResponse {
  answer: string;
  tokensUsed: number;
}

export async function callAskFollowUp(
  request: AskFollowUpRequest
): Promise<AskFollowUpResponse> {
  const fn = httpsCallable<AskFollowUpRequest, AskFollowUpResponse>(
    functions,
    "askFollowUp"
  );

  const result = await fn(request);
  return result.data;
}

// ============ Error Helpers ============

export function isRateLimitError(error: unknown): boolean {
  return (
    error != null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "functions/resource-exhausted"
  );
}

export function getRateLimitMessage(error: unknown): string {
  if (
    error != null &&
    typeof error === "object" &&
    "message" in error
  ) {
    return (error as { message: string }).message;
  }
  return "利用上限に達しました。";
}

export async function callGetDailyPrompts(): Promise<DailyPrompts> {
  const fn = httpsCallable<Record<string, never>, DailyPrompts>(
    functions,
    "getDailyPrompts"
  );
  const result = await fn({});
  return result.data;
}

// ============ Test: Plan Switch ============

export async function callTestSwitchPlan(
  plan: "free" | "pro"
): Promise<{ success: boolean; plan: string }> {
  const fn = httpsCallable<
    { plan: "free" | "pro" },
    { success: boolean; plan: string }
  >(functions, "testSwitchPlan");

  const result = await fn({ plan });
  return result.data;
}

// ============ Token Usage ============

export interface TokenUsageResponse {
  tokensUsed: number;
  tokenLimit: number;
  periodStart: string;
  periodEnd: string;
  daysUntilReset: number;
  plan: string;
}

export async function callGetTokenUsage(): Promise<TokenUsageResponse> {
  const fn = httpsCallable<Record<string, never>, TokenUsageResponse>(
    functions,
    "getTokenUsage"
  );

  const result = await fn({});
  return result.data;
}

// ============ Delete Account ============

export interface DeleteAccountResponse {
  success: boolean;
  deleted: {
    writings: number;
    vocab: number;
  };
}

export async function callDeleteAccount(): Promise<DeleteAccountResponse> {
  const fn = httpsCallable<Record<string, never>, DeleteAccountResponse>(
    functions,
    "deleteAccount"
  );

  const result = await fn({});
  return result.data;
}
