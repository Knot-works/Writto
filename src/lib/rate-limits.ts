import type { Plan } from "@/types";

// Token-based limits (cumulative for free, monthly for pro)
export const TOKEN_LIMITS: Record<Plan, number> = {
  free: 20_000,      // ~6 sessions (累計・お試し用)
  pro: 2_000_000,    // ~800 gradings/month
};

// Estimated tokens per operation
export const ESTIMATED_TOKENS = {
  generatePrompt: 800,
  gradeWriting: 2500,
  lookupWord: 600,
};

// Format token count for display
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(0)}K`;
  }
  return tokens.toString();
}

// Calculate usage percentage
export function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

// Get estimated remaining operations
export function getEstimatedRemaining(
  tokensRemaining: number,
  operation: keyof typeof ESTIMATED_TOKENS
): number {
  const cost = ESTIMATED_TOKENS[operation];
  return Math.floor(tokensRemaining / cost);
}

// Legacy daily limits (kept for reference, no longer enforced)
export const PLAN_LIMITS: Record<Plan, { gradeWriting: number; generatePrompt: number; lookupWord: number }> = {
  free: {
    generatePrompt: 10,
    gradeWriting: 3,
    lookupWord: 20,
  },
  pro: {
    generatePrompt: 999,
    gradeWriting: 999,
    lookupWord: 999,
  },
};

export function getRemainingCount(
  plan: Plan,
  operation: keyof typeof PLAN_LIMITS["free"],
  used: number
): number {
  return Math.max(0, PLAN_LIMITS[plan][operation] - used);
}
