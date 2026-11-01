import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { getDueReviewItems } from "../../src/domain/review/spacedRepetition";
import { deriveStatus, countMasteredWords } from "../../src/domain/learning/mastery";
import { normalizeUserData } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 25. Legacy solved ids migrate to 'learning', never to mastery
console.log("\n25. Learning Progress Migration:");
export const legacyLearner = normalizeUserData({
  xp: 200,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-02", "a1-mm-03"],
} as Partial<UserData>);
assert(Object.keys(legacyLearner.learningProgress).length === 3, "Every legacy solved id is carried into the recall record");
assert(
  Object.values(legacyLearner.learningProgress).every((item) => deriveStatus(item) === "learning"),
  "Legacy solved ids adopt 'learning', never an inflated status"
);
assert(countMasteredWords(legacyLearner.learningProgress) === 0, "Migration never invents mastered words");

// A large back catalogue must not all come due on upgrade day
export const bigLearner = normalizeUserData({
  xp: 3000,
  solvedQuestionIds: getQuestionsByLevel("A1").slice(0, 200).map((q) => q.id),
} as Partial<UserData>);
export const dueOnUpgradeDay = getDueReviewItems(bigLearner.learningProgress).length;
assert(
  dueOnUpgradeDay < 200,
  `Migrated schedules are spread over days, not dumped at once (${dueOnUpgradeDay} due today)`
);
assert(dueOnUpgradeDay > 0, "Some migrated words are still due immediately so review can begin");

