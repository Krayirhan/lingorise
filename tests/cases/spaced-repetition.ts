import { DEFAULT_EASE_FACTOR } from "../../src/domain/review/spacedRepetition";
import { DAY_MS } from "../support/learningFixtures";
import { recordLearningOutcome, deriveStatus } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 2. Spaced Repetition (SM-2) Algorithm
console.log("\n2. Spaced Repetition (SM-2) Engine:");
export const t0 = 1_700_000_000_000;
export let sched = recordLearningOutcome(undefined, true, "2026-08-24", t0);
assert(sched.intervalDays === 1, "First successful recall schedules 1 day out");
assert(sched.easeFactor > DEFAULT_EASE_FACTOR, "A correct recall raises the ease factor");

sched = recordLearningOutcome(sched, true, "2026-08-25", t0 + DAY_MS);
assert(sched.intervalDays === 3, "Second successful recall schedules 3 days out");

sched = recordLearningOutcome(sched, true, "2026-08-28", t0 + 4 * DAY_MS);
assert(sched.intervalDays > 3, "Third recall grows the interval via the ease factor");

export const beforeLapse = sched.easeFactor;
export const lapsed = recordLearningOutcome(sched, false, "2026-08-29", t0 + 5 * DAY_MS);
assert(lapsed.easeFactor < beforeLapse, "A lapse lowers the ease factor");
assert(lapsed.intervalDays === 0, "A lapse collapses the interval for relearning");
assert(lapsed.nextReviewAt > t0 + 5 * DAY_MS, "A lapsed word is rescheduled shortly, not immediately");

// Intervals must keep growing rather than deleting the word from the schedule
export let longTerm = recordLearningOutcome(undefined, true, "2026-01-01", t0);
for (let step = 1; step <= 6; step += 1) {
  longTerm = recordLearningOutcome(longTerm, true, `2026-01-0${step + 1}`, t0 + step * 10 * DAY_MS);
}
assert(longTerm.intervalDays >= 21, `Well-known words reach long spacing (${longTerm.intervalDays} days)`);
assert(deriveStatus(longTerm) === "mastered", "A word recalled repeatedly across days becomes mastered");
assert(longTerm.nextReviewAt > 0, "A mastered word stays scheduled instead of being deleted");

