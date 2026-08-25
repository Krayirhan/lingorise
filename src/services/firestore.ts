import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { LearningItemProgress, UserData } from "../types/user";
import { MeaningMatchQuestion } from "../types/content";
import { mergeLearningProgress } from "../domain/learning/mastery";
import { normalizeUserData } from "./storage";

import { withRetry } from "./errorReporter";
import { logger } from "../utils/logger";

/**
 * Firestore returns serverTimestamp() fields as Timestamp objects, not plain
 * numbers. Every other layer (merge logic, storage, tests) works in epoch ms,
 * so the conversion happens once, right at the network boundary.
 */
function resolveServerSyncedTimestamps(
  learningProgress: Record<string, LearningItemProgress> | undefined
): Record<string, LearningItemProgress> | undefined {
  if (!learningProgress || typeof learningProgress !== "object") return learningProgress;
  const resolved: Record<string, LearningItemProgress> = {};
  for (const [id, item] of Object.entries(learningProgress)) {
    const raw: unknown = (item as LearningItemProgress & { serverSyncedAt?: unknown }).serverSyncedAt;
    const serverSyncedAt =
      raw && typeof (raw as { toMillis?: () => number }).toMillis === "function"
        ? (raw as { toMillis: () => number }).toMillis()
        : typeof raw === "number"
          ? raw
          : undefined;
    resolved[id] = { ...item, serverSyncedAt };
  }
  return resolved;
}

function resolveServerDate(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  if (raw && typeof (raw as { toDate?: () => Date }).toDate === "function") {
    return (raw as { toDate: () => Date }).toDate().toISOString().split("T")[0];
  }
  if (raw && typeof (raw as { toMillis?: () => number }).toMillis === "function") {
    return new Date((raw as { toMillis: () => number }).toMillis()).toISOString().split("T")[0];
  }
  if (typeof raw === "number") {
    return new Date(raw).toISOString().split("T")[0];
  }
  return undefined;
}

/** Fetches remote user document from Firestore */
export async function fetchUserData(userId: string): Promise<UserData | null> {
  try {
    return await withRetry(async () => {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const data = snap.data() as UserData & { lastKnownServerDate?: unknown };
        return {
          ...data,
          learningProgress: resolveServerSyncedTimestamps(data.learningProgress) || {},
          lastKnownServerDate: resolveServerDate(data.lastKnownServerDate),
        };
      }
      return null;
    }, 2, 400);
  } catch (error) {
    logger.warn("LingoRise: fetchUserData error", error);
    return null;
  }
}

/** Deletes remote user document and progress from Firestore */
export async function deleteUserData(userId: string): Promise<void> {
  try {
    await withRetry(async () => {
      // Every word answered writes a doc under users/{uid}/items (roadmap
      // Birim 13.3 — the account-deletion audit). This subcollection was
      // never cleaned up here: "Hesabımı Kalıcı Olarak Sil" deleted the
      // profile and progress summary but silently left up to one Firestore
      // document per question ever answered (590 possible) orphaned behind.
      // Firestore's client SDK has no bulk collection delete, so each
      // document is deleted individually, batched 500 at a time (Firestore's
      // own batch limit).
      const itemsSnap = await getDocs(collection(db, "users", userId, "items"));
      const docs = itemsSnap.docs;
      for (let i = 0; i < docs.length; i += 500) {
        const batch = writeBatch(db);
        for (const itemDoc of docs.slice(i, i + 500)) {
          batch.delete(itemDoc.ref);
        }
        await batch.commit();
      }

      await deleteDoc(doc(db, "users", userId, "progress", "main"));
      await deleteDoc(doc(db, "users", userId));
    }, 2);
  } catch (error) {
    logger.warn("LingoRise: deleteUserData error", error);
    throw error;
  }
}

/** Mirrors the current local progress into the signed-in user's Firestore document. */
export async function syncUserData(userId: string, data: UserData): Promise<void> {
  try {
    await withRetry(async () => {
      // Every word gets stamped with the server's clock, not this device's,
      // so the next merge can resolve a tie without trusting either device's
      // idea of what time it is.
      const learningProgress = Object.fromEntries(
        Object.entries(data.learningProgress || {}).map(([id, item]) => [
          id,
          { ...item, serverSyncedAt: serverTimestamp() },
        ])
      );
      await setDoc(
        doc(db, "users", userId),
        {
          ...data,
          learningProgress,
          userId,
          lastKnownServerDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }, 3, 500);
  } catch (err) {
    logger.warn("LingoRise: syncUserData failed after retries", err);
    throw err;
  }
}

export async function syncUserProgress(userId: string, data: UserData): Promise<void> {
  try {
    await withRetry(async () => {
      await setDoc(
        doc(db, "users", userId, "progress", "main"),
        {
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          lastActiveDate: data.lastActiveDate,
          practiceHistory: data.practiceHistory || [],
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }, 3, 500);
  } catch (err) {
    logger.warn("LingoRise: syncUserProgress failed after retries", err);
    throw err;
  }
}

/** Writes a per-word learning record. Content remains immutable under /items. */
export async function syncLearningItemProgress(
  userId: string,
  question: MeaningMatchQuestion,
  data: UserData,
  isCorrect: boolean
): Promise<void> {
  // The local recall record is authoritative; mirroring it keeps the cloud copy
  // from claiming a stronger status than the learner has actually earned.
  const local = data.learningProgress?.[question.id];

  try {
    await setDoc(doc(db, "users", userId, "items", question.id), {
      itemId: question.id,
      contentVersion: question.contentVersion || "v1",
      level: question.level,
      unitId: question.unitId || `${question.level.toLowerCase()}-u01`,
      status: local?.status || "learning",
      attempts: local?.attempts ?? increment(1),
      correctCount: local?.correctCount ?? increment(isCorrect ? 1 : 0),
      wrongCount: local?.wrongCount ?? increment(isCorrect ? 0 : 1),
      repetitions: local?.repetitions ?? 0,
      distinctCorrectDays: local?.distinctCorrectDays ?? 0,
      intervalDays: local?.intervalDays ?? 0,
      easeFactor: local?.easeFactor ?? null,
      nextReviewAt: local?.nextReviewAt ?? null,
      lastAnsweredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    logger.warn("LingoRise: per-item progress sync failed", err);
  }
}

/** Merges local and remote user data upon login and persists the unified record to Firestore. */
export async function mergeAndSyncUserData(userId: string, localData: UserData): Promise<UserData> {
  const rawRemote = await fetchUserData(userId);
  if (!rawRemote) {
    await syncUserData(userId, localData);
    await syncUserProgress(userId, localData);
    return localData;
  }
  const remote = normalizeUserData(rawRemote);

  const mergedXp = Math.max(localData.xp || 0, remote.xp || 0);
  const mergedStreak = Math.max(localData.streak || 0, remote.streak || 0);
  const mergedSolved = Array.from(new Set([...(localData.solvedQuestionIds || []), ...(remote.solvedQuestionIds || [])]));
  const mergedRewarded = Array.from(new Set([...(localData.rewardedQuestionIds || []), ...(remote.rewardedQuestionIds || [])]));
  const mergedBadges = Array.from(new Set([...(localData.unlockedBadges || []), ...(remote.unlockedBadges || [])]));

  const mergedData: UserData = {
    ...localData,
    ...remote,
    xp: mergedXp,
    streak: mergedStreak,
    solvedQuestionIds: mergedSolved,
    rewardedQuestionIds: mergedRewarded,
    unlockedBadges: mergedBadges,
    learningProgress: mergeLearningProgress(
      localData.learningProgress || {},
      remote.learningProgress || {}
    ),
    onboardingCompleted: true,
  };

  await syncUserData(userId, mergedData);
  await syncUserProgress(userId, mergedData);

  return mergedData;
}

export function getDailyTaskCollection(userId: string) {
  return collection(db, "users", userId, "dailyTasks");
}
