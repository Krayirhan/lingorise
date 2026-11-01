import { createDailyQuests, DAILY_QUEST_PRACTICE_ID } from "../gamification/badges";
import { deriveStatus } from "../learning/mastery";
import { LearningItemProgress } from "../models/user";
import { DEFAULT_EASE_FACTOR } from "../review/spacedRepetition";
import { DEFAULT_USER_DATA } from "./userDefaults";
import { LegacyReviewItem, RawUserData } from "./migrationTypes";

const DAY_MS = 24 * 60 * 60 * 1000;
const MIGRATION_SPREAD_DAYS = 7;

function migrateLearningProgress(
  stored: unknown,
  solvedQuestionIds: string[],
  legacyReviewQueue: LegacyReviewItem[],
  currentTime: () => number
): Record<string, LearningItemProgress> {
  const migrated: Record<string, LearningItemProgress> = {};

  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    for (const [id, item] of Object.entries(stored as Record<string, LearningItemProgress>)) {
      const repaired: LearningItemProgress = {
        status: item.status || "learning",
        attempts: item.attempts ?? 0,
        correctCount: item.correctCount ?? 0,
        wrongCount: item.wrongCount ?? 0,
        repetitions: item.repetitions ?? 0,
        distinctCorrectDays: item.distinctCorrectDays ?? 0,
        lastCorrectDate: item.lastCorrectDate,
        intervalDays: item.intervalDays ?? 0,
        easeFactor: item.easeFactor || DEFAULT_EASE_FACTOR,
        nextReviewAt: item.nextReviewAt ?? 0,
        lastAnsweredAt: item.lastAnsweredAt,
        serverSyncedAt: item.serverSyncedAt,
      };
      migrated[id] = { ...repaired, status: deriveStatus(repaired) };
    }
  } else {
    // A solved id only ever meant "answered right once", so it is adopted as
    // `learning` — claiming anything stronger would recreate the inflated
    // percentages this record exists to replace.
    //
    // Their schedules are spread across the coming days rather than all coming
    // due at once: a learner with hundreds of solved words should not open the
    // app to a wall of reviews that also blocks every new word.
    const now = currentTime();
    solvedQuestionIds.forEach((id, index) => {
      const dayOffset = index % MIGRATION_SPREAD_DAYS;
      migrated[id] = {
        status: "learning",
        attempts: 1,
        correctCount: 1,
        wrongCount: 0,
        repetitions: 1,
        distinctCorrectDays: 1,
        intervalDays: 1,
        easeFactor: DEFAULT_EASE_FACTOR,
        nextReviewAt: now + dayOffset * DAY_MS,
        lastAnsweredAt: now,
      };
    });
  }

  // Words that only lived in the old mistake queue keep their schedule so no
  // pending review is silently dropped by the rewrite.
  for (const legacy of legacyReviewQueue) {
    if (!legacy?.questionId) continue;
    const existing = migrated[legacy.questionId];
    const item: LearningItemProgress = {
      status: existing?.status || "learning",
      attempts: existing?.attempts ?? Math.max(1, legacy.mistakeCount || 1),
      correctCount: existing?.correctCount ?? 0,
      wrongCount: existing?.wrongCount ?? (legacy.mistakeCount || 1),
      repetitions: existing?.repetitions ?? (legacy.repetitions || 0),
      distinctCorrectDays: existing?.distinctCorrectDays ?? 0,
      lastCorrectDate: existing?.lastCorrectDate,
      intervalDays: legacy.intervalDays ?? existing?.intervalDays ?? 0,
      easeFactor: legacy.easeFactor || existing?.easeFactor || DEFAULT_EASE_FACTOR,
      nextReviewAt: legacy.nextReviewAt ?? existing?.nextReviewAt ?? currentTime(),
      lastAnsweredAt: existing?.lastAnsweredAt ?? legacy.lastMistakeAt,
    };
    migrated[legacy.questionId] = { ...item, status: deriveStatus(item) };
  }

  return migrated;
}

/**
 * v1 → v2: the pre-mastery-tracking shape — only solvedQuestionIds and/or
 * the old mistake queue — gets a real per-word learningProgress record for
 * the first time.
 *
 * This step intentionally still detects its own input by SHAPE (does a
 * structured learningProgress object already exist?) inside
 * migrateLearningProgress, rather than trusting the caller's version number
 * to decide whether to run at all. That is not an oversight: it makes the
 * step idempotent and self-healing, so it stays safe to run unconditionally
 * on every load — not gated to "only when version < 2" — repairing a record
 * with a missing serverSyncedAt or a stale derived `status` even on data
 * that is already nominally current. A version-number gate alone would lose
 * that safety net the first time schemaVersion itself is missing, wrong, or
 * from a future app version being opened on an older build.
 */
export function migrateV1ToV2(data: RawUserData, now: () => number = Date.now): RawUserData {
  const legacyReviewQueue: LegacyReviewItem[] = Array.isArray(data.reviewQueue) ? data.reviewQueue : [];
  return {
    ...data,
    learningProgress: migrateLearningProgress(
      data.learningProgress,
      Array.isArray(data.solvedQuestionIds) ? data.solvedQuestionIds : [],
      legacyReviewQueue,
      now
    ),
  };
}

/**
 * Quests saved before the daily-rollover rewrite counted "answers submitted"
 * with a target of 2 while the UI promised a full session. Detected by
 * shape (see migrateV1ToV2's comment for why), not by trusting a version
 * number.
 */
export function isLegacyQuestSet(quests: unknown): boolean {
  if (!Array.isArray(quests) || quests.length === 0) return true;
  const practice = quests.find((quest) => quest?.id === DAILY_QUEST_PRACTICE_ID);
  return !practice || typeof practice.target !== "number" || practice.target <= 2;
}

/**
 * v2 → v3: reissues quest records still carrying the pre-daily-rollover
 * shape, so nobody is left staring at a permanently completed two-step day.
 * Same self-detecting design as migrateV1ToV2, for the same reason.
 */
export function migrateV2ToV3(data: RawUserData): RawUserData {
  if (!isLegacyQuestSet(data.dailyQuests)) return data;
  const sessionSize = [5, 10, 20, 30].includes(data.practiceSessionSize as number)
    ? (data.practiceSessionSize as number)
    : DEFAULT_USER_DATA.practiceSessionSize;
  const hadLegacyReviewQueue = Array.isArray(data.reviewQueue) && data.reviewQueue.length > 0;
  return {
    ...data,
    dailyQuests: createDailyQuests(sessionSize, hadLegacyReviewQueue),
  };
}

/**
 * Fills in safe defaults for any field that is missing or malformed. This is
 * NOT a version migration — it is defensive normalization that must run on
 * every load regardless of schema version, since storage can be corrupted,
 * partially written, or simply new (a fresh install with no legacy shape at
 * all). By the time this runs, migrateV1ToV2/migrateV2ToV3 have already
 * guaranteed learningProgress and dailyQuests are well-formed, so this only
 * has to defend the remaining fields.
 */
