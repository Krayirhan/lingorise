import { getDueReviewItems, isItemDue } from "../../src/domain/review/spacedRepetition";
import { recordLearningOutcome } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 21. Spacing is actually enforced
console.log("\n21. Spaced Repetition Interval Enforcement:");
export const freshMistake = recordLearningOutcome(undefined, false, "2026-08-24", Date.now());
assert(freshMistake.nextReviewAt > Date.now(), "A freshly missed word is scheduled into the future");
assert(!isItemDue(freshMistake), "A freshly missed word is not immediately due");
assert(getDueReviewItems({ w: freshMistake }).length === 0, "A freshly missed word is absent from the due list");

export const overdue = { ...freshMistake, nextReviewAt: Date.now() - 1000 };
assert(getDueReviewItems({ w: overdue }).length === 1, "A word past its scheduled time becomes due");
assert(getDueReviewItems({}).length === 0, "An empty record produces no due words");

// Most overdue material is surfaced first
export const dueOrder = getDueReviewItems({
  later: { ...freshMistake, nextReviewAt: Date.now() - 1000 },
  earlier: { ...freshMistake, nextReviewAt: Date.now() - 90000 },
});
assert(dueOrder[0].questionId === "earlier", "Due words are ordered most-overdue first");

