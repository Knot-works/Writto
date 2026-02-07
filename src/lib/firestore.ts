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
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile,
  Writing,
  VocabEntry,
  UserStats,
  WritingMode,
  DailyUsage,
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
  await setDoc(doc(db, "users", userId), {
    ...profile,
    createdAt: Timestamp.now(),
  }, { merge: true });
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, "users", userId), updates);
}

// ============ Writings ============

export async function saveWriting(
  userId: string,
  writing: Omit<Writing, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "users", userId, "writings"), {
    ...writing,
    userId,
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
  entry: Omit<VocabEntry, "id" | "userId" | "createdAt" | "reviewCount">
): Promise<string> {
  const ref = await addDoc(collection(db, "users", userId, "vocabulary"), {
    ...entry,
    userId,
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

// ============ Daily Usage ============

export async function getUserDailyUsage(
  userId: string
): Promise<DailyUsage> {
  const dateStr = getTodayJST();
  const snap = await getDoc(doc(db, "users", userId, "dailyUsage", dateStr));
  if (!snap.exists()) {
    return { gradeWriting: 0, generatePrompt: 0, lookupWord: 0 };
  }
  const data = snap.data();
  return {
    gradeWriting: data.gradeWriting || 0,
    generatePrompt: data.generatePrompt || 0,
    lookupWord: data.lookupWord || 0,
  };
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
