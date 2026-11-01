import { getQuestionsByLevel, isLevelReady, getNextLevel } from "../support/bundledCatalogue";
import { evaluatePromotion } from "../support/learningFixtures";
import { assert } from "../support/assertions";

// 29. Promotion is earned by passing the level exam, and never opens onto
// empty content (roadmap 18-srs-flow-hardening.md "sınav" redesign).
console.log("\n29. Level Promotion:");
export const a1Questions = getQuestionsByLevel("A1");

export const barelyStarted = evaluatePromotion("A1", [], []);
assert(!barelyStarted.isEarned, "A level is not earned before its exam is passed");
assert(!barelyStarted.shouldCelebrate, "No celebration is offered before the exam is passed");

export const earned = evaluatePromotion("A1", ["A1"], []);
assert(earned.isEarned, "A1 is earned once its exam is passed");
assert(earned.shouldCelebrate, "An uncelebrated earned level triggers the celebration");
assert(earned.nextLevel === "A2", "The next level on the ladder is offered");
assert(getNextLevel("B2") === "C1", "The ladder advances in CEFR order");
assert(getNextLevel("C2") === null, "There is nothing beyond the final level");

// The content gate: A2 was expanded past the readiness threshold in Sprint 6,
// so promotion into it is now genuinely offered.
assert(earned.isNextLevelReady, "A2 is now reported as ready — content expansion cleared the gate");
assert(isLevelReady("A2"), "isLevelReady accepts A2 now that it has 100+ words");
assert(isLevelReady("A1"), "isLevelReady accepts a fully populated level");
assert(!isLevelReady("B1"), "B1 remains unavailable until its editorial remediation is complete");

export const alreadyCelebrated = evaluatePromotion("A1", ["A1"], ["A1"]);
assert(alreadyCelebrated.isEarned, "An earned level stays earned");
assert(!alreadyCelebrated.shouldCelebrate, "The celebration is shown once, not on every launch");

