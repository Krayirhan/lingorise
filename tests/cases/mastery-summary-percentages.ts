import { recordLearningOutcome, summarizeMastery, countMasteredWords } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";
import { word } from "./mastery-derivation";
// 23. Mastery summary drives the percentages screens are allowed to show
console.log("\n23. Mastery Summary & Percentages:");
export const pool = ["w1", "w2", "w3", "w4"];
export const progressMap = {
  w1: word,
  w2: recordLearningOutcome(recordLearningOutcome(undefined, true, "2026-08-24", 1), true, "2026-08-24", 2),
  w3: recordLearningOutcome(undefined, true, "2026-08-24", 1),
};
export const summary = summarizeMastery(progressMap, pool);
assert(summary.mastered === 1, "Summary counts exactly one mastered word");
assert(summary.review === 1, "Summary counts exactly one word in review");
assert(summary.learning === 1, "Summary counts exactly one word still being learned");
assert(summary.notStarted === 1, "Summary counts untouched words as not started");
assert(summary.masteredPercent === 25, "Percentage reflects mastered words only (1 of 4)");
assert(summary.inProgress === 2, "In-progress work is reported separately, not hidden");
assert(countMasteredWords(progressMap) === 1, "Global mastered count matches the summary");

