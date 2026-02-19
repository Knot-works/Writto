/**
 * Spaced Repetition System (SRS) utility
 * Based on SM-2 algorithm (used by Anki)
 */

import type { SRSRating, VocabEntry } from "@/types";

// Default SRS values for new cards
export const SRS_DEFAULTS = {
  easeFactor: 2.5,
  interval: 1,
} as const;

// Minimum ease factor to prevent cards from becoming too hard
const MIN_EASE_FACTOR = 1.3;

// Interval modifiers for each rating
const INTERVAL_MODIFIERS: Record<SRSRating, number> = {
  again: 0,     // Reset to 1 day
  hard: 0.8,    // 80% of calculated interval
  good: 1.0,    // Normal interval
  easy: 1.3,    // 130% of calculated interval
};

// Ease factor adjustments for each rating
const EASE_ADJUSTMENTS: Record<SRSRating, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

export interface SRSUpdate {
  easeFactor: number;
  interval: number;
  nextReviewAt: Date;
  reviewCount: number;
  lastReviewedAt: Date;
}

/**
 * Calculate the next SRS values based on user's rating
 */
export function calculateSRS(
  entry: VocabEntry,
  rating: SRSRating
): SRSUpdate {
  const currentEase = entry.easeFactor ?? SRS_DEFAULTS.easeFactor;
  const currentInterval = entry.interval ?? SRS_DEFAULTS.interval;
  const now = new Date();

  // Calculate new ease factor
  let newEase = currentEase + EASE_ADJUSTMENTS[rating];
  newEase = Math.max(MIN_EASE_FACTOR, newEase);

  // Calculate new interval
  let newInterval: number;

  if (rating === "again") {
    // Reset to 1 day for "again"
    newInterval = 1;
  } else if (entry.reviewCount === 0 || currentInterval <= 1) {
    // First review or very short interval
    switch (rating) {
      case "hard":
        newInterval = 1;
        break;
      case "good":
        newInterval = 3;
        break;
      case "easy":
        newInterval = 4;
        break;
      default:
        newInterval = 1;
    }
  } else {
    // Standard SM-2 calculation
    newInterval = Math.round(
      currentInterval * newEase * INTERVAL_MODIFIERS[rating]
    );
    newInterval = Math.max(1, newInterval);
  }

  // Calculate next review date
  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    easeFactor: Number(newEase.toFixed(2)),
    interval: newInterval,
    nextReviewAt,
    reviewCount: (entry.reviewCount || 0) + 1,
    lastReviewedAt: now,
  };
}

/**
 * Get the estimated next review intervals for display
 */
export function getNextReviewPreview(
  entry: VocabEntry
): Record<SRSRating, string> {
  const results: Record<SRSRating, string> = {
    again: "",
    hard: "",
    good: "",
    easy: "",
  };

  const ratings: SRSRating[] = ["again", "hard", "good", "easy"];

  for (const rating of ratings) {
    const update = calculateSRS(entry, rating);
    results[rating] = formatInterval(update.interval);
  }

  return results;
}

/**
 * Format interval as human-readable string
 */
export function formatInterval(days: number): string {
  if (days < 1) {
    return "< 1日";
  } else if (days === 1) {
    return "1日";
  } else if (days < 7) {
    return `${days}日`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks}週間`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return `${months}ヶ月`;
  } else {
    const years = Math.round(days / 365);
    return `${years}年`;
  }
}

/**
 * Check if a vocab entry is due for review
 */
export function isDueForReview(entry: VocabEntry): boolean {
  if (!entry.nextReviewAt) {
    return true; // Never reviewed
  }
  return new Date() >= entry.nextReviewAt;
}

/**
 * Sort vocab entries by review priority
 * Overdue items first, then by how overdue they are
 */
export function sortByReviewPriority(entries: VocabEntry[]): VocabEntry[] {
  const now = new Date();

  return [...entries].sort((a, b) => {
    const aNext = a.nextReviewAt?.getTime() ?? 0;
    const bNext = b.nextReviewAt?.getTime() ?? 0;

    // Items without nextReviewAt (never reviewed) come first
    if (!a.nextReviewAt && b.nextReviewAt) return -1;
    if (a.nextReviewAt && !b.nextReviewAt) return 1;
    if (!a.nextReviewAt && !b.nextReviewAt) {
      // Sort by creation date (older first)
      return a.createdAt.getTime() - b.createdAt.getTime();
    }

    // Both have nextReviewAt - sort by due date
    return aNext - bNext;
  });
}
