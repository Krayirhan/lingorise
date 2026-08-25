import { LearningItemProgress, LearningStatus } from "../../types/user";
import { DEFAULT_EASE_FACTOR, scheduleNextReview } from "../review/spacedRepetition";

/** Consecutive correct recalls needed before a word counts as consolidated. */
const REVIEW_THRESHOLD = 2;
/** Consecutive correct recalls needed before a word can be called mastered. */
const MASTERED_THRESHOLD = 3;
/**
 * A word must survive on more than one day before it counts as mastered.
 * Without this you could "master" a whole level in a single sitting, which is
 * exactly the illusion solvedQuestionIds used to create.
 */
const MASTERED_MIN_DISTINCT_DAYS = 2;

export function createLearningItem(): LearningItemProgress {
  return {
    status: "new",
    attempts: 0,
    correctCount: 0,
    wrongCount: 0,
    consecutiveWrongCount: 0,
    repetitions: 0,
    distinctCorrectDays: 0,
    intervalDays: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReviewAt: 0,
  };
}

/** Anki'nin varsayılan leech eşiğiyle aynı — art arda 8 yanlıştan sonra bir kelime "kronik zor" sayılır. */
export const LEECH_THRESHOLD = 8;

/** Chronic error (leech) detection: words failed 8 or more times in a row. */
export function isLeech(item: LearningItemProgress | undefined): boolean {
  if (!item) return false;
  return (item.consecutiveWrongCount || 0) >= LEECH_THRESHOLD;
}

/**
 * Status is always derived, never stored independently, so it cannot drift out
 * of sync with the counters behind it.
 */
export function deriveStatus(item: LearningItemProgress): LearningStatus {
  if (item.attempts === 0) return "new";
  if (
    item.repetitions >= MASTERED_THRESHOLD &&
    item.distinctCorrectDays >= MASTERED_MIN_DISTINCT_DAYS
  ) {
    return "mastered";
  }
  if (item.repetitions >= REVIEW_THRESHOLD) return "review";
  return "learning";
}

/**
 * Folds one answer into a word's record. A wrong answer resets the recall
 * streak, so mastery can fall as well as rise — that is the whole point of
 * measuring recall instead of counting taps.
 */
export function recordLearningOutcome(
  previous: LearningItemProgress | undefined,
  isCorrect: boolean,
  todayDate: string,
  answeredAt: number
): LearningItemProgress {
  const base = previous || createLearningItem();

  const isNewCorrectDay = isCorrect && base.lastCorrectDate !== todayDate;
  const repetitions = isCorrect ? base.repetitions + 1 : 0;
  const consecutiveWrongCount = isCorrect ? 0 : (base.consecutiveWrongCount || 0) + 1;

  // Recall record and schedule move together, from one answer, so they can
  // never disagree about how well a word is known.
  const schedule = scheduleNextReview(
    { repetitions, intervalDays: base.intervalDays, easeFactor: base.easeFactor },
    isCorrect,
    answeredAt
  );

  const next: LearningItemProgress = {
    ...base,
    attempts: base.attempts + 1,
    correctCount: base.correctCount + (isCorrect ? 1 : 0),
    wrongCount: base.wrongCount + (isCorrect ? 0 : 1),
    consecutiveWrongCount,
    repetitions,
    distinctCorrectDays: base.distinctCorrectDays + (isNewCorrectDay ? 1 : 0),
    lastCorrectDate: isCorrect ? todayDate : base.lastCorrectDate,
    lastAnsweredAt: answeredAt,
    status: base.status,
    ...schedule,
  };

  return { ...next, status: deriveStatus(next) };
}

export interface MasterySummary {
  mastered: number;
  review: number;
  learning: number;
  notStarted: number;
  total: number;
  /** Share of the pool genuinely recalled over time, as a whole percent. */
  masteredPercent: number;
  /** Words in flight — seen but not yet consolidated. */
  inProgress: number;
}

/** Rolls per-word records up into the numbers screens are allowed to show. */
export function summarizeMastery(
  learningProgress: Record<string, LearningItemProgress>,
  questionIds: string[]
): MasterySummary {
  let mastered = 0;
  let review = 0;
  let learning = 0;

  for (const id of questionIds) {
    const item = learningProgress[id];
    if (!item) continue;
    const status = deriveStatus(item);
    if (status === "mastered") mastered += 1;
    else if (status === "review") review += 1;
    else if (status === "learning") learning += 1;
  }

  const total = questionIds.length;
  const notStarted = Math.max(0, total - mastered - review - learning);

  return {
    mastered,
    review,
    learning,
    notStarted,
    total,
    masteredPercent: total > 0 ? Math.min(100, Math.round((mastered / total) * 100)) : 0,
    inProgress: review + learning,
  };
}

/**
 * Picks which of two records for the same word survives a merge. Attempt
 * count is the primary signal because it never depends on either device's
 * clock. When attempts tie, prefer Firestore's serverSyncedAt over the
 * device-clock lastAnsweredAt — two devices can disagree about what time it
 * is, but the server cannot disagree with itself. Only when neither side has
 * ever synced (both serverSyncedAt undefined) does the tie-break fall back to
 * the device clock, same as before this existed.
 *
 * The whole record is taken atomically, never spliced field-by-field, so the
 * winning nextReviewAt/easeFactor/repetitions can never end up mismatched
 * against each other.
 */
function pickRicherRecord(
  a: LearningItemProgress,
  b: LearningItemProgress
): LearningItemProgress {
  if (a.attempts !== b.attempts) return a.attempts > b.attempts ? a : b;
  if (a.serverSyncedAt !== undefined && b.serverSyncedAt !== undefined) {
    return a.serverSyncedAt >= b.serverSyncedAt ? a : b;
  }
  return (a.lastAnsweredAt || 0) >= (b.lastAnsweredAt || 0) ? a : b;
}

/**
 * Reconciles two recall records for the same learner (device and cloud).
 * The richer history wins per word, so signing in can never erase practice
 * that only one side saw.
 */
export function mergeLearningProgress(
  local: Record<string, LearningItemProgress>,
  remote: Record<string, LearningItemProgress>
): Record<string, LearningItemProgress> {
  const merged: Record<string, LearningItemProgress> = { ...remote };

  for (const [id, localItem] of Object.entries(local || {})) {
    const remoteItem = merged[id];
    merged[id] = remoteItem ? pickRicherRecord(localItem, remoteItem) : localItem;
  }

  return merged;
}

/** Total mastered words across every level — the garden's future fuel. */
export function countMasteredWords(
  learningProgress: Record<string, LearningItemProgress>
): number {
  return Object.values(learningProgress).filter((item) => deriveStatus(item) === "mastered").length;
}
