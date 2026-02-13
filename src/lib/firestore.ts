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
  UserStats,
  WritingMode,
  MistakeEntry,
  Improvement,
  AnalysisPeriod,
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
  entry: Omit<VocabEntry, "id" | "createdAt" | "reviewCount">
): Promise<string> {
  const ref = await addDoc(collection(db, "users", userId, "vocabulary"), {
    ...entry,
    reviewCount: 0,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getVocabulary(
  userId: string,
  limitCount: number = 100
): Promise<VocabEntry[]> {
  const q = query(
    collection(db, "users", userId, "vocabulary"),
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
      lastReviewedAt: data.lastReviewedAt?.toDate() || undefined,
    } as VocabEntry;
  });
}

export async function deleteVocab(
  userId: string,
  vocabId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "vocabulary", vocabId));
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
