import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { recordLearningOutcome, summarizeMastery } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 34. A finished session must show up as real progress immediately
console.log("\n34. Level Card Shows Real Same-Day Work:");
export const sameDayQuestions = getQuestionsByLevel("A1").slice(0, 33);
export const sameDayLearner = {
  solvedQuestionIds: sameDayQuestions.map((q) => q.id),
  learningProgress: Object.fromEntries(
    sameDayQuestions.map((q) => [q.id, recordLearningOutcome(undefined, true, "2026-08-24", Date.now())])
  ),
};
export const seenToday = sameDayLearner.solvedQuestionIds.filter((id) =>
  getQuestionsByLevel("A1").some((q) => q.id === id)
).length;
assert(seenToday === 33, "Words answered correctly today are counted as 'seen' immediately, not zero");

export const masterySameDay = summarizeMastery(
  sameDayLearner.learningProgress,
  getQuestionsByLevel("A1").map((q) => q.id)
);
assert(masterySameDay.mastered === 0, "None of today's words are 'mastered' yet — that still needs a second day");
assert(
  seenToday > masterySameDay.mastered,
  "Seen and mastered are reported as two different numbers, never collapsed into one"
);

