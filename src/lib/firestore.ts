import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  deleteField,
  Timestamp,
  type FieldValue,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile,
  Writing,
  VocabEntry,
  VocabDeck,
  UserStats,
  WritingMode,
  MistakeEntry,
  Improvement,
  AnalysisPeriod,
  Level,
} from "@/types";
import type { DailyPrompts } from "./functions";

// ============ User Profile ============

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as UserProfile;
}

export async function saveUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const docRef = doc(db, "users", userId);
  const existing = await getDoc(docRef);

  if (existing.exists()) {
    // Update: don't change createdAt or plan (protected by security rules)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt: _createdAt, plan: _plan, ...updates } = profile;
    await updateDoc(docRef, updates);
  } else {
    // Create: set all fields including createdAt
    await setDoc(docRef, {
      ...profile,
      createdAt: Timestamp.now(),
    });
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  // Convert undefined values to deleteField() to properly remove them from Firestore
  const processedUpdates: Record<string, unknown | FieldValue> = {};
  for (const [key, value] of Object.entries(updates)) {
    processedUpdates[key] = value === undefined ? deleteField() : value;
  }
  await updateDoc(doc(db, "users", userId), processedUpdates);
}

// ============ Writings ============

export async function saveWriting(
  userId: string,
  writing: Omit<Writing, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "users", userId, "writings"), {
    ...writing,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getWriting(
  userId: string,
  writingId: string
): Promise<Writing | null> {
  const snap = await getDoc(
    doc(db, "users", userId, "writings", writingId)
  );
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as Writing;
}

export async function getWritings(
  userId: string,
  limitCount: number = 20
): Promise<Writing[]> {
  const q = query(
    collection(db, "users", userId, "writings"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Writing;
  });
}

export async function getWritingsByMode(
  userId: string,
  mode: WritingMode,
  limitCount: number = 20
): Promise<Writing[]> {
  const q = query(
    collection(db, "users", userId, "writings"),
    where("mode", "==", mode),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Writing;
  });
}

// ============ Vocabulary ============

export async function saveVocab(
  userId: string,
  entry: Omit<VocabEntry, "id" | "createdAt" | "reviewCount">,
  deckId?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "users", userId, "vocabulary"), {
    ...entry,
    ...(deckId && { deckId }),
    reviewCount: 0,
    createdAt: Timestamp.now(),
  });

  // Update deck vocab count if deckId is provided
  if (deckId) {
    await updateDeckVocabCount(userId, deckId, 1);
  }

  return ref.id;
}

export async function getVocabulary(
  userId: string,
  limitCount: number = 100,
  deckId?: string | null
): Promise<VocabEntry[]> {
  let q;

  if (deckId === null) {
    // Get vocabulary without deckId (default "My Vocabulary")
    // Note: Firestore doesn't support querying for missing fields directly,
    // so we fetch all and filter client-side for null deckId
    q = query(
      collection(db, "users", userId, "vocabulary"),
      orderBy("createdAt", "desc"),
      limit(limitCount * 2) // Fetch more to account for filtering
    );
  } else if (deckId) {
    // Get vocabulary for specific deck
    q = query(
      collection(db, "users", userId, "vocabulary"),
      where("deckId", "==", deckId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
  } else {
    // Get all vocabulary (no deck filter)
    q = query(
      collection(db, "users", userId, "vocabulary"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
  }

  const snap = await getDocs(q);

  let entries = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastReviewedAt: data.lastReviewedAt?.toDate() || undefined,
    } as VocabEntry;
  });

  // Filter for null deckId if requested
  if (deckId === null) {
    entries = entries.filter((e) => !e.deckId).slice(0, limitCount);
  }

  return entries;
}

export async function deleteVocab(
  userId: string,
  vocabId: string
): Promise<void> {
  // Get the vocab entry first to check if it has a deckId
  const vocabRef = doc(db, "users", userId, "vocabulary", vocabId);
  const vocabSnap = await getDoc(vocabRef);

  if (vocabSnap.exists()) {
    const data = vocabSnap.data();
    const deckId = data.deckId;

    await deleteDoc(vocabRef);

    // Update deck vocab count if deckId exists
    if (deckId) {
      await updateDeckVocabCount(userId, deckId, -1);
    }
  }
}

export async function updateVocabReview(
  userId: string,
  vocabId: string,
  srsUpdate?: {
    easeFactor: number;
    interval: number;
    nextReviewAt: Date;
    reviewCount: number;
  }
): Promise<void> {
  const docRef = doc(db, "users", userId, "vocabulary", vocabId);

  if (srsUpdate) {
    // SRS-based update
    await updateDoc(docRef, {
      reviewCount: srsUpdate.reviewCount,
      lastReviewedAt: Timestamp.now(),
      easeFactor: srsUpdate.easeFactor,
      interval: srsUpdate.interval,
      nextReviewAt: Timestamp.fromDate(srsUpdate.nextReviewAt),
    });
  } else {
    // Legacy update (increment review count)
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    await updateDoc(docRef, {
      reviewCount: (data.reviewCount || 0) + 1,
      lastReviewedAt: Timestamp.now(),
    });
  }
}

// ============ Vocabulary Decks ============

export async function createDeck(
  userId: string,
  deck: {
    name: string;
    description?: string;
    theme?: string;
    category?: string;
    level?: Level;
  }
): Promise<string> {
  const now = Timestamp.now();
  // Filter out undefined values (Firestore doesn't accept undefined)
  const cleanDeck = Object.fromEntries(
    Object.entries(deck).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, "users", userId, "decks"), {
    ...cleanDeck,
    vocabCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function getDecks(userId: string): Promise<VocabDeck[]> {
  const q = query(
    collection(db, "users", userId, "decks"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as VocabDeck;
  });
}

export async function getDeck(
  userId: string,
  deckId: string
): Promise<VocabDeck | null> {
  const snap = await getDoc(doc(db, "users", userId, "decks", deckId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as VocabDeck;
}

export async function updateDeck(
  userId: string,
  deckId: string,
  updates: Partial<Omit<VocabDeck, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "decks", deckId), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDeck(
  userId: string,
  deckId: string
): Promise<void> {
  // First, delete all vocabulary in this deck
  const vocabQuery = query(
    collection(db, "users", userId, "vocabulary"),
    where("deckId", "==", deckId)
  );
  const vocabSnap = await getDocs(vocabQuery);

  // Delete vocabulary entries
  for (const vocabDoc of vocabSnap.docs) {
    await deleteDoc(vocabDoc.ref);
  }

  // Delete the deck
  await deleteDoc(doc(db, "users", userId, "decks", deckId));
}

async function updateDeckVocabCount(
  userId: string,
  deckId: string,
  delta: number
): Promise<void> {
  const deckRef = doc(db, "users", userId, "decks", deckId);
  const deckSnap = await getDoc(deckRef);

  if (deckSnap.exists()) {
    const currentCount = deckSnap.data().vocabCount || 0;
    await updateDoc(deckRef, {
      vocabCount: Math.max(0, currentCount + delta),
      updatedAt: Timestamp.now(),
    });
  }
}

// Check for existing terms in a deck to prevent duplicates
export async function getExistingTermsInDeck(
  userId: string,
  deckId: string | null
): Promise<Set<string>> {
  let q;
  if (deckId === null) {
    // Get terms from "My Vocabulary" (no deckId)
    q = query(
      collection(db, "users", userId, "vocabulary"),
      limit(1000)
    );
  } else {
    q = query(
      collection(db, "users", userId, "vocabulary"),
      where("deckId", "==", deckId),
      limit(1000)
    );
  }

  const snap = await getDocs(q);
  const terms = new Set<string>();

  snap.docs.forEach((d) => {
    const data = d.data();
    // Filter for null deckId if checking "My Vocabulary"
    if (deckId === null && data.deckId) return;
    // Normalize term for comparison (lowercase, trim)
    terms.add(data.term?.toLowerCase().trim() || "");
  });

  return terms;
}

// Batch save vocabulary to a deck (with duplicate prevention)
export async function saveVocabBatch(
  userId: string,
  entries: Omit<VocabEntry, "id" | "createdAt" | "reviewCount">[],
  deckId: string
): Promise<{ savedIds: string[]; duplicateCount: number }> {
  // Get existing terms in the deck
  const existingTerms = await getExistingTermsInDeck(userId, deckId);

  // Filter out duplicates
  const uniqueEntries = entries.filter(
    (entry) => !existingTerms.has(entry.term.toLowerCase().trim())
  );

  const duplicateCount = entries.length - uniqueEntries.length;
  const ids: string[] = [];
  const now = Timestamp.now();

  for (const entry of uniqueEntries) {
    const ref = await addDoc(collection(db, "users", userId, "vocabulary"), {
      ...entry,
      deckId,
      reviewCount: 0,
      createdAt: now,
    });
    ids.push(ref.id);
  }

  // Update deck vocab count (only for non-duplicates)
  if (uniqueEntries.length > 0) {
    await updateDeckVocabCount(userId, deckId, uniqueEntries.length);
  }

  return { savedIds: ids, duplicateCount };
}

// ============ Daily Prompts (Cache) ============

function getTodayJST(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

export async function getDailyPromptsFromCache(): Promise<DailyPrompts | null> {
  const dateStr = getTodayJST();
  const snap = await getDoc(doc(db, "dailyPrompts", dateStr));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    goal: data.goal,
    hobby: data.hobby,
  } as DailyPrompts;
}

// ============ Stats ============

export async function getUserStats(
  userId: string
): Promise<UserStats | null> {
  const snap = await getDoc(doc(db, "users", userId, "meta", "stats"));
  if (!snap.exists()) return null;
  return snap.data() as UserStats;
}

export async function updateUserStats(
  userId: string,
  stats: Partial<UserStats>
): Promise<void> {
  await setDoc(doc(db, "users", userId, "meta", "stats"), stats, {
    merge: true,
  });
}

function getTodayDateString(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

function getYesterdayDateString(): string {
  return new Date(Date.now() + 9 * 3600_000 - 24 * 3600_000).toISOString().slice(0, 10);
}

export async function updateStreak(userId: string): Promise<void> {
  const statsRef = doc(db, "users", userId, "meta", "stats");
  const statsSnap = await getDoc(statsRef);
  const stats = statsSnap.exists() ? (statsSnap.data() as UserStats) : null;

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const lastWritingDate = stats?.lastWritingDate;
  let currentStreak = stats?.currentStreak || 0;
  let bestStreak = stats?.bestStreak || 0;

  if (lastWritingDate === today) {
    // Already wrote today, no change
    return;
  } else if (lastWritingDate === yesterday) {
    // Consecutive day
    currentStreak += 1;
  } else {
    // Streak broken or first writing
    currentStreak = 1;
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  await setDoc(
    statsRef,
    {
      currentStreak,
      bestStreak,
      lastWritingDate: today,
      totalWritings: (stats?.totalWritings || 0) + 1,
    },
    { merge: true }
  );
}

// ============ Mistakes (間違いノート) ============

export async function saveMistakes(
  userId: string,
  improvements: Improvement[],
  writingId: string,
  prompt: string
): Promise<void> {
  const mistakesRef = collection(db, "users", userId, "mistakes");
  const now = Timestamp.now();

  // Save each improvement as a mistake entry
  for (const imp of improvements) {
    await addDoc(mistakesRef, {
      original: imp.original,
      suggested: imp.suggested,
      explanation: imp.explanation,
      type: imp.type,
      subType: imp.subType || `other_${imp.type}`,
      sourceWritingId: writingId,
      sourcePrompt: prompt,
      createdAt: now,
    });
  }
}

function getPeriodStartDate(period: AnalysisPeriod): Date | null {
  if (period === "all") return null;

  const now = new Date();
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export async function getMistakes(
  userId: string,
  options: {
    period?: AnalysisPeriod;
    type?: string;
    limitCount?: number;
  } = {}
): Promise<MistakeEntry[]> {
  const { period = "all", type, limitCount = 200 } = options;

  const q = query(
    collection(db, "users", userId, "mistakes"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  let mistakes = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as MistakeEntry;
  });

  // Filter by period (client-side for simplicity)
  const startDate = getPeriodStartDate(period);
  if (startDate) {
    mistakes = mistakes.filter((m) => m.createdAt >= startDate);
  }

  // Filter by type
  if (type) {
    mistakes = mistakes.filter((m) => m.type === type);
  }

  return mistakes;
}

export async function deleteMistake(
  userId: string,
  mistakeId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "mistakes", mistakeId));
}
