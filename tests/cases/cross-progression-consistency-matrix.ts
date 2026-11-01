import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { evaluateBadges } from "../../src/domain/gamification/badges";
import { recordLearningOutcome, summarizeMastery } from "../../src/domain/learning/mastery";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 47. Cross-progression-system consistency matrix (roadmap Birim 11.1)
// "Bölüm ↔ Terfi": can a learner be promoted (80% mastered) without having
// finished seeing the level's units? Mastery can never exceed how much was
// seen — this is structural in summarizeMastery (a word only gets a
// learningProgress entry, and therefore a status, once it has been
// answered), not an assumption. Confirmed here rather than left as an
// unverified "probably fine" per the roadmap's own framing of this pair.
console.log("\n47. Cross-Progression Consistency Matrix (roadmap Birim 11.1):");
{
  const partiallySeenPool = getQuestionsByLevel("A1").slice(0, 60).map((q) => q.id);
  const partialProgress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};
  // Only the first 20 of the 60-word sample were ever seen at all.
  partiallySeenPool.slice(0, 20).forEach((id, i) => {
    partialProgress[id] = recordLearningOutcome(undefined, true, "2026-08-24", i);
  });
  const partialSummary = summarizeMastery(partialProgress, partiallySeenPool);
  const seenCount = Object.keys(partialProgress).length;
  assert(
    partialSummary.mastered <= seenCount,
    "Mastered count can never exceed how many words were actually seen — a word cannot be mastered before it exists in learningProgress"
  );
  assert(
    partialSummary.mastered + partialSummary.review + partialSummary.learning === seenCount,
    "Every seen word is accounted for in exactly one in-progress bucket — none are silently dropped or double-counted"
  );

  // "Rozet ↔ Mastery": badge_first_step and badge_garden_lover intentionally
  // stay solvedQuestionIds-based (roadmap's own stated principle — low-
  // threshold, early-motivation badges don't need to wait for mastery).
  // badge_master_review does NOT — verified directly in test 5.
  const earlyBadgeUser: UserData = {
    ...DEFAULT_USER_DATA,
    xp: 1,
    solvedQuestionIds: ["a1-mm-01"],
    learningProgress: {}, // seen but nothing is anywhere close to mastered
  };
  assert(
    evaluateBadges(earlyBadgeUser).includes("badge_first_step"),
    "badge_first_step intentionally stays reachable from 'seen' alone — confirmed by roadmap's own low-threshold/early-motivation principle, not an oversight"
  );
}

