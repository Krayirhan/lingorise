import { recordLearningOutcome, deriveStatus } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 22. Mastery is earned over days, never in one sitting
console.log("\n22. Mastery Derivation:");
export let word = recordLearningOutcome(undefined, true, "2026-08-24", 1);
assert(deriveStatus(word) === "learning", "One correct answer only reaches 'learning'");

word = recordLearningOutcome(word, true, "2026-08-24", 2);
assert(deriveStatus(word) === "review", "Two consecutive correct answers reach 'review'");

word = recordLearningOutcome(word, true, "2026-08-24", 3);
assert(deriveStatus(word) !== "mastered", "Three correct answers in ONE day still cannot be 'mastered'");
assert(word.distinctCorrectDays === 1, "Same-day answers count as a single correct day");

word = recordLearningOutcome(word, true, "2026-08-25", 4);
assert(deriveStatus(word) === "mastered", "Recall confirmed on a second day reaches 'mastered'");

export const forgotten = recordLearningOutcome(word, false, "2026-08-26", 5);
assert(deriveStatus(forgotten) === "learning", "A wrong answer demotes a mastered word back to 'learning'");
assert(forgotten.repetitions === 0, "A wrong answer resets the recall streak");
assert(forgotten.distinctCorrectDays === 2, "History of correct days survives a lapse");

