import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserData } from "../types/user";
import { MeaningMatchQuestion } from "../types/content";
import { mergeLearningProgress } from "../domain/learning/mastery";
import { normalizeUserData } from "./storage";

import { withRetry } from "./errorReporter";
import { logger } from "../utils/logger";

/** Fetches remote user document from Firestore */
export async function fetchUserData(userId: string): Promise<UserData | null> {
  try {
    return await withRetry(async () => {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        return snap.data() as UserData;
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
      await setDoc(
        doc(db, "users", userId),
        {
          ...data,
          userId,
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
