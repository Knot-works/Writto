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
  keywords?: string[];
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
  customInput?: string,
  lang?: "ja" | "ko"
): Promise<PromptResponse> {
  const fn = httpsCallable<
    { profile: ProfileData; mode: string; customInput?: string; lang?: string },
    PromptResponse
  >(functions, "generatePrompt");

  const result = await fn({
    profile: toProfileData(profile),
    mode,
    customInput,
    lang: lang || "ja",
  });

  return result.data;
}

export async function callGradeWriting(
  profile: UserProfile,
  prompt: string,
  userAnswer: string,
  lang?: "ja" | "en" | "ko"
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
  lang?: "ja" | "en" | "ko"
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
  lang?: "ja" | "en" | "ko";
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

export async function callGetDailyPrompts(lang?: "ja" | "ko"): Promise<DailyPrompts> {
  const fn = httpsCallable<{ lang?: string }, DailyPrompts>(
    functions,
    "getDailyPrompts"
  );
  const result = await fn({ lang: lang || "ja" });
  return result.data;
}

// ============ Stripe: Checkout Session ============

export async function callCreateCheckoutSession(
  billingCycle: "monthly" | "yearly",
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string }> {
  const fn = httpsCallable<
    { billingCycle: "monthly" | "yearly"; successUrl: string; cancelUrl: string },
    { url: string }
  >(functions, "createCheckoutSession");

  const result = await fn({ billingCycle, successUrl, cancelUrl });
  return result.data;
}

// ============ Stripe: Customer Portal ============

export async function callCreatePortalSession(
  returnUrl: string
): Promise<{ url: string }> {
  const fn = httpsCallable<
    { returnUrl: string },
    { url: string }
  >(functions, "createPortalSession");

  const result = await fn({ returnUrl });
  return result.data;
}

// ============ Stripe: Get Subscription Details ============

export interface SubscriptionDetails {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
  billingCycle: "monthly" | "yearly";
}

export async function callGetSubscriptionDetails(): Promise<SubscriptionDetails> {
  const fn = httpsCallable<Record<string, never>, SubscriptionDetails>(
    functions,
    "getSubscriptionDetails"
  );

  const result = await fn({});
  return result.data;
}

// ============ Token Usage ============

export interface TokenUsageResponse {
  tokensUsed: number;
  tokenLimit: number;
  periodStart: string | null;  // null for free plan (no reset)
  periodEnd: string | null;    // null for free plan (no reset)
  daysUntilReset: number;      // -1 for free plan (no reset)
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

// ============ OCR Handwriting ============

export interface OcrResponse {
  text: string;
  tokensUsed: number;
}

export async function callOcrHandwriting(
  imageBase64: string,
  mimeType: string
): Promise<OcrResponse> {
  const fn = httpsCallable<
    { imageBase64: string; mimeType: string },
    OcrResponse
  >(functions, "ocrHandwriting");

  const result = await fn({ imageBase64, mimeType });
  return result.data;
}

export function isProOnlyError(error: unknown): boolean {
  return (
    error != null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "functions/permission-denied"
  );
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

// ============ Feedback ============

export type FeedbackCategory = "bug" | "feature" | "other";

export interface SubmitFeedbackRequest {
  category: FeedbackCategory;
  content: string;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  id: string;
}

export async function callSubmitFeedback(
  request: SubmitFeedbackRequest
): Promise<SubmitFeedbackResponse> {
  const fn = httpsCallable<SubmitFeedbackRequest, SubmitFeedbackResponse>(
    functions,
    "submitFeedback"
  );

  const result = await fn(request);
  return result.data;
}

// ============ Generate Vocabulary Deck ============

export type VocabGenerationType = "word" | "expression" | "both";

export interface GenerateVocabularyRequest {
  theme: string;
  category?: string;
  vocabType: VocabGenerationType;
  count: number;
  level: "beginner" | "intermediate" | "advanced" | "native";
  lang?: "ja" | "ko";
}

export interface GeneratedVocabItem {
  term: string;
  meaning: string;
  example: string;
  type: "word" | "expression";
}

export interface GenerateVocabularyResponse {
  vocabulary: GeneratedVocabItem[];
  tokensUsed: number;
}

export async function callGenerateVocabulary(
  request: GenerateVocabularyRequest
): Promise<GenerateVocabularyResponse> {
  const fn = httpsCallable<GenerateVocabularyRequest, GenerateVocabularyResponse>(
    functions,
    "generateVocabulary"
  );

  const result = await fn(request);
  return result.data;
}
