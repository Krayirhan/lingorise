import { LearningItemProgress, ReviewItem } from "../../types/user";
import { now as clockNow } from "../../utils/clock";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/** How soon a missed word comes back. Short enough to relearn, long enough to space. */
export const RELEARN_DELAY_MS = 20 * MINUTE;

export const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.8;
const EASE_BONUS = 0.1;
const EASE_PENALTY = 0.2;

/** First two steps are fixed; after that the ease factor takes over. */
const FIRST_INTERVAL_DAYS = 1;
const SECOND_INTERVAL_DAYS = 3;
/** Caps runaway spacing so nothing disappears for years. */
const MAX_INTERVAL_DAYS = 365;

const JITTER_RATIO = 0.05; // ±%5
const JITTER_MIN_DAYS = 4; // bundan kısa aralıklar sallanmaz (1 ve 3 günlük sabit adımlar dokunulmaz kalır)

/** Aynı gün zamanlanan çok sayıda kelimenin aynı günde tekrar birikmesini önler. Test edilebilirlik için random enjekte edilebilir. */
export function applyIntervalJitter(days: number, random: () => number = Math.random): number {
  if (days < JITTER_MIN_DAYS) return days;
  const range = Math.max(1, Math.round(days * JITTER_RATIO));
  const offset = Math.floor(random() * (2 * range + 1)) - range;
  return Math.max(JITTER_MIN_DAYS, days + offset);
}

/**
 * The next spacing for a word, in days, after a successful recall.
 * Repetition 1 → 1 day, 2 → 3 days, then previous × ease. With the default
 * ease this walks out to roughly 8, 20, 50, 125 days on its own, so a mastered
 * word keeps a long, quiet schedule instead of being deleted.
 */
export function nextIntervalDays(
  repetitions: number,
  previousInterval: number,
  easeFactor: number,
  random: () => number = Math.random
): number {
  if (repetitions <= 1) return FIRST_INTERVAL_DAYS;
  if (repetitions === 2) return SECOND_INTERVAL_DAYS;
  const grown = Math.round(Math.max(previousInterval, SECOND_INTERVAL_DAYS) * easeFactor);
  const clamped = Math.min(MAX_INTERVAL_DAYS, Math.max(SECOND_INTERVAL_DAYS + 1, grown));
  return applyIntervalJitter(clamped, random);
}

/**
 * Applies one answer to a word's schedule. Every studied word is scheduled —
 * correct ones far out, missed ones close in — so this is a real spacing
 * system rather than a list of mistakes.
 */
export function scheduleNextReview(
  item: Pick<LearningItemProgress, "repetitions" | "intervalDays" | "easeFactor">,
  isCorrect: boolean,
  now: number
): Pick<LearningItemProgress, "intervalDays" | "easeFactor" | "nextReviewAt"> {
  const currentEase = item.easeFactor || DEFAULT_EASE_FACTOR;

  if (!isCorrect) {
    return {
      intervalDays: 0,
      easeFactor: Math.max(MIN_EASE_FACTOR, currentEase - EASE_PENALTY),
      nextReviewAt: now + RELEARN_DELAY_MS,
    };
  }

  const easeFactor = Math.min(MAX_EASE_FACTOR, currentEase + EASE_BONUS);
  const intervalDays = nextIntervalDays(item.repetitions, item.intervalDays || 0, easeFactor);

  return {
    intervalDays,
    easeFactor,
    nextReviewAt: now + intervalDays * DAY,
  };
}

/** True when a word has reached its scheduled time. */
export function isItemDue(item: LearningItemProgress | undefined, now: number = clockNow()): boolean {
  if (!item || item.attempts === 0) return false;
  return item.nextReviewAt <= now;
}

/**
 * Every word whose scheduled time has passed, soonest first, so the most
 * overdue material is always what the learner sees next.
 */
export function getDueReviewItems(
  learningProgress: Record<string, LearningItemProgress>,
  now: number = clockNow()
): ReviewItem[] {
  return Object.entries(learningProgress || {})
    .filter(([, item]) => isItemDue(item, now))
    .map(([questionId, item]) => ({
      questionId,
      nextReviewAt: item.nextReviewAt,
      intervalDays: item.intervalDays,
      repetitions: item.repetitions,
      easeFactor: item.easeFactor,
    }))
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}

/**
 * Pulls a word forward so it is asked again shortly. Used by "remind me later",
 * which is a request from the learner rather than a scheduling decision.
 */
export function bringForward(
  item: LearningItemProgress,
  now: number = clockNow()
): LearningItemProgress {
  return { ...item, nextReviewAt: Math.min(item.nextReviewAt, now + RELEARN_DELAY_MS) };
}
