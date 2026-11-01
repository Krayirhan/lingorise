import { createDailyQuests, DAILY_QUEST_PRACTICE_ID } from "../../src/domain/gamification/badges";
import { normalizeUserData, migrateV1ToV2, migrateV2ToV3 } from "../../src/domain/user/normalization";
import { assert } from "../support/assertions";

// 48. Migration steps are isolated, single-purpose functions (roadmap
// Birim 8 / 20) — each tested directly, not only through normalizeUserData's
// end-to-end behavior.
console.log("\n48. Isolated Migration Steps (roadmap Birim 8/20):");
{
  // migrateV1ToV2: the oldest shape (solvedQuestionIds only) gets a real
  // learningProgress record synthesized.
  const v1Shape = migrateV1ToV2({ solvedQuestionIds: ["a1-mm-01", "a1-mm-02"] });
  assert(
    Object.keys(v1Shape.learningProgress || {}).length === 2,
    "migrateV1ToV2 synthesizes a learningProgress entry for every legacy solved id"
  );
  assert(
    Object.values(v1Shape.learningProgress || {}).every((item) => item.status === "learning"),
    "migrateV1ToV2 never invents a status stronger than 'learning' from a bare solved id"
  );

  // migrateV1ToV2 is idempotent — it repairs already-structured data too,
  // by design (see the function's own comment on why it doesn't gate on a
  // version number).
  const alreadyV2 = migrateV1ToV2({
    learningProgress: { "a1-mm-01": { status: "learning", attempts: 1, correctCount: 1, wrongCount: 0, repetitions: 1, distinctCorrectDays: 1, intervalDays: 1, easeFactor: 2.5, nextReviewAt: 0 } },
  });
  assert(
    Object.keys(alreadyV2.learningProgress || {}).length === 1,
    "migrateV1ToV2 leaves already-structured learningProgress data intact rather than re-synthesizing it"
  );

  // migrateV2ToV3: a legacy quest set (target <= 2) is reissued with the
  // real session size.
  const v2Shape = migrateV2ToV3({
    practiceSessionSize: 20,
    dailyQuests: [{ id: DAILY_QUEST_PRACTICE_ID, titleKey: "x", current: 0, target: 2, xpReward: 30, completed: false }],
  } as any);
  assert(
    v2Shape.dailyQuests?.find((q) => q.id === DAILY_QUEST_PRACTICE_ID)?.target === 20,
    "migrateV2ToV3 reissues a legacy quest set to match the real session size"
  );

  // migrateV2ToV3 is a no-op on already-current data — proving it is safe
  // to run unconditionally on every load, not just once at a version
  // boundary.
  const alreadyV3Quests = createDailyQuests(20, false);
  const v3Shape = migrateV2ToV3({ practiceSessionSize: 20, dailyQuests: alreadyV3Quests } as any);
  assert(
    v3Shape.dailyQuests === alreadyV3Quests,
    "migrateV2ToV3 returns the exact same quest array reference when it is already current — a true no-op, not a reconstruction"
  );
}

