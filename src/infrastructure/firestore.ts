import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { MeaningMatchQuestion } from "../domain/models/content";
import { LearningItemProgress, UserData } from "../domain/models/user";
import { RemoteUserDataResult } from "../domain/sync/remoteSync";
import { db } from "./firebase";

import { logger } from "../utils/logger";
import { withRetry } from "./errorReporter";

export type { RemoteUserDataResult } from "../domain/sync/remoteSync";

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

/**
 * Fetches the remote user document, distinguishing "does not exist" from
 * "the read failed" (DATA-QA-001 / GLOBAL-QA-003). Callers that must not
 * treat an unknown remote state as an empty one (the merge path) should use
 * this instead of `fetchUserData`.
 */
export async function fetchUserDataResult(userId: string): Promise<RemoteUserDataResult> {
  try {
    return await withRetry(async () => {
      // A cached snapshot can be stale or absent even though the server has
      // progress. Never authorize a profile merge from an offline cache.
      const snap = await getDocFromServer(doc(db, "users", userId));
      if (!snap.exists()) return { status: "absent" as const };
      const data = snap.data() as UserData & { lastKnownServerDate?: unknown };
      return {
        status: "found" as const,
        data: {
          ...data,
          learningProgress: resolveServerSyncedTimestamps(data.learningProgress) || {},
          lastKnownServerDate: resolveServerDate(data.lastKnownServerDate),
        },
      };
    }, 2, 400);
  } catch (error) {
    logger.warn("Lingterra: fetchUserDataResult error", error);
    return { status: "failed", error };
  }
}

/**
 * Fetches remote user data, collapsing "absent" and "failed" to `null`.
 * Safe only for callers where that distinction doesn't matter (e.g. an
 * optional informational read) — the merge path must use
 * `fetchUserDataResult` instead, since it must never treat a failed read as
 * an empty account.
 */
export async function fetchUserData(userId: string): Promise<UserData | null> {
  const result = await fetchUserDataResult(userId);
  return result.status === "found" ? result.data : null;
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

      // `dailyTasks/{date}` docs (one per day the user has been active) were
      // never purged here — the exact same shape of gap as the `items`
      // subcollection above, just discovered later (SEC-QA-003 / DATA-QA-004).
      const dailyTasksSnap = await getDocs(collection(db, "users", userId, "dailyTasks"));
      const dailyTaskDocs = dailyTasksSnap.docs;
      for (let i = 0; i < dailyTaskDocs.length; i += 500) {
        const batch = writeBatch(db);
        for (const taskDoc of dailyTaskDocs.slice(i, i + 500)) {
          batch.delete(taskDoc.ref);
        }
        await batch.commit();
      }

      await deleteDoc(doc(db, "users", userId, "progress", "main"));
      await deleteDoc(doc(db, "users", userId));
    }, 2);
  } catch (error) {
    logger.warn("Lingterra: deleteUserData error", error);
    throw error;
  }
}

/** Mirrors the current local progress into the signed-in user's Firestore document. */
export async function syncUserData(userId: string, data: UserData): Promise<void> {
  try {
    await withRetry(async () => {
      // An in-progress practice belongs to this device and profile. Do not
      // write it into the account document during ordinary synchronization.
      const { activeSession: _activeSession, lastCompletedWord: _lastCompletedWord, ...accountData } = data;
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
          ...accountData,
          learningProgress,
          userId,
          lastKnownServerDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }, 3, 500);
  } catch (err) {
    logger.warn("Lingterra: syncUserData failed after retries", err);
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
    logger.warn("Lingterra: syncUserProgress failed after retries", err);
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
    logger.warn("Lingterra: per-item progress sync failed", err);
  }
}

