import { assessLevelChoice } from "../support/learningFixtures";
import { assert } from "../support/assertions";

// 30. Level choice is guided, never blocked
console.log("\n30. Soft Gate on Level Choice:");
export const earlyJump = assessLevelChoice("B1", "A1", []);
assert(earlyJump.isAhead, "Jumping ahead before passing the current level's exam is flagged as early");

export const informedJump = assessLevelChoice("A2", "A1", ["A1"]);
assert(!informedJump.isAhead, "A learner who passed their level's exam is not warned");

export const stepBack = assessLevelChoice("A1", "A1", []);
assert(!stepBack.isAhead, "Staying on the current level is never flagged");

