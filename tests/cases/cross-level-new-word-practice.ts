import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { buildDailySession } from "../support/learningFixtures";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { assert } from "../support/assertions";
import { a1Questions } from "./level-promotion";
// 31. Switching levels never leaks a word from the old level into new-word
// practice on the new one.
console.log("\n31. Cross-Level New-Word Practice:");
export const a2Questions = getQuestionsByLevel("A2");
export const crossLevelUser = {
  ...DEFAULT_USER_DATA,
  level: "A2" as const,
  practiceSessionSize: 5 as const,
  rewardedQuestionIds: [a1Questions[0].id],
  solvedQuestionIds: [a1Questions[0].id],
};

export const crossLevelNewSession = buildDailySession(crossLevelUser);
assert(
  crossLevelNewSession.every((q) => a2Questions.some((a2) => a2.id === q.id)),
  "New-word practice draws only from the level the learner is now on"
);
assert(
  !crossLevelNewSession.some((q) => q.id === a1Questions[0].id),
  "A word rewarded on the old level does not leak into the new level's new-word session"
);

