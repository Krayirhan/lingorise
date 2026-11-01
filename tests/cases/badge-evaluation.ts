import { evaluateBadges } from "../../src/domain/gamification/badges";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 5. Badge Unlocking Engine
console.log("\n5. Badge Evaluation:");
export const testUser: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 160,
  streak: 3,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-02", "a1-mm-03", "a1-mm-04", "a1-mm-05"],
  // badge_master_review was repurposed from a repetition-based "25 mastered
  // words" threshold (which depended entirely on the retired spaced-
  // repetition review queue) to passing 2+ level completion exams (roadmap
  // 18-srs-flow-hardening.md "sınav" redesign, 2026-08-26).
  passedLevelExams: ["A1", "A2"],
};
export const badges = evaluateBadges(testUser);
assert(badges.includes("badge_first_step"), "First Step badge unlocked");
assert(badges.includes("badge_quick_grow"), "Quick Grow badge unlocked at 160 XP");
assert(badges.includes("badge_garden_lover"), "Garden Lover badge unlocked at 5 solved questions");
assert(badges.includes("badge_streak_3"), "Streak 3 badge unlocked");
assert(badges.includes("badge_master_review"), "Master Review badge unlocked");

