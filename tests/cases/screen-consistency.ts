import { tr, copyByLocale } from "../../src/i18n/en";
import { allQuestions } from "../support/bundledCatalogue";
import { getDueReviewItems } from "../../src/domain/review/spacedRepetition";
import { DAY_MS } from "../support/learningFixtures";
import { getTopicLabel } from "../../src/features/home/topicLabel";
import { recordLearningOutcome } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 32. One number, one meaning — no raw keys, no divergent counts
console.log("\n32. Screen Consistency:");
export const consistencyProgress: Record<string, any> = {
  a: { ...recordLearningOutcome(undefined, true, "2026-08-01", 1), nextReviewAt: Date.now() - 1000 },
  b: { ...recordLearningOutcome(undefined, true, "2026-08-01", 2), nextReviewAt: Date.now() + DAY_MS },
};
export const dueEverywhere = getDueReviewItems(consistencyProgress).length;
assert(dueEverywhere === 1, "The due count reflects the schedule, not the lifetime mistake tally");

// Every topic in the catalogue resolves to a human label
export const trCopy = copyByLocale.tr;
export const rawTopics = Array.from(new Set(allQuestions.map((q) => q.topic).filter(Boolean)));
export const unlabelled = rawTopics.filter((topic) => {
  const label = getTopicLabel(trCopy, topic);
  return label.includes("_");
});
assert(unlabelled.length === 0, `No raw content key reaches the screen (checked ${rawTopics.length} topics)`);
assert(getTopicLabel(trCopy, "core_verbs") === "Temel Fiiller", "Generated topics resolve to Turkish labels");
assert(getTopicLabel(trCopy, "Sıfatlar") === "Sıfatlar", "Hand-written Turkish topics pass through untouched");

