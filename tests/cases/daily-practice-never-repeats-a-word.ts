import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { DAY_MS, buildDailySession } from "../support/learningFixtures";
import { recordLearningOutcome } from "../../src/domain/learning/mastery";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { assert } from "../support/assertions";

// 27. Daily practice is always and only new words (roadmap
// 18-srs-flow-hardening.md "sınav" redesign, 2026-08-26): a learner is never
// shown a word they've already met a second time. Reinforcement/review was
// retired entirely — level completion is decided by the exam (see Birim 52).
console.log("\n27. Daily Practice Never Repeats a Word:");
export const a1Pool = getQuestionsByLevel("A1");

export const noDueSession = buildDailySession({ ...DEFAULT_USER_DATA, practiceSessionSize: 5 });
assert(noDueSession.length === 5, "A fresh learner's session fills up to the chosen size");

// A word already mastered (rewarded) but with nothing currently due for it
// (e.g. its next review is scheduled far in the future) must still never
// reappear in new-word practice — only rewardedQuestionIds membership
// decides "already met", not the moment-to-moment due state.
export const alreadyMetButNotDue = {
  ...recordLearningOutcome(undefined, true, "2026-08-01", 1),
  nextReviewAt: Date.now() + 30 * DAY_MS,
};
export const noRepeatSession = buildDailySession({
  ...DEFAULT_USER_DATA,
  practiceSessionSize: 10,
  rewardedQuestionIds: [a1Pool[0].id],
  solvedQuestionIds: [a1Pool[0].id],
  learningProgress: { [a1Pool[0].id]: alreadyMetButNotDue },
});
assert(
  !noRepeatSession.some((q) => q.id === a1Pool[0].id),
  "A word already met stays out of new-word practice even when it isn't due yet"
);
assert(
  noRepeatSession.length === 10,
  "Solving 1 word in a 10-word lesson still yields a full 10-word session instead of dropping to 9"
);

for (const size of [5, 10, 20, 30] as const) {
  for (const solvedCount of [0, 1, 5, 6, 10, 15, 40]) {
    const firstTopicPool = a1Pool.filter((q) => q.topicId === "a1.people_identity");
    const solvedSlice = firstTopicPool.slice(0, solvedCount).map((q) => q.id);
    const session = buildDailySession({
      ...DEFAULT_USER_DATA,
      practiceSessionSize: size,
      rewardedQuestionIds: solvedSlice,
      solvedQuestionIds: solvedSlice,
    });
    assert(
      session.length === size,
      `Session size ${size} returns exactly ${size} words after ${solvedCount} words solved (got ${session.length})`
    );
  }
}


