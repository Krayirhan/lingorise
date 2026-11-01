import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 11. Guest to Cloud Data Merge Algorithm
console.log("\n11. Guest-to-Cloud Merge Simulation:");
export const guestData: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 150,
  streak: 4,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-02"],
  unlockedBadges: ["badge_first_step", "badge_quick_grow"],
};
export const cloudData: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 220,
  streak: 2,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-03"],
  unlockedBadges: ["badge_first_step", "badge_streak_3"],
};
export const mergedXp = Math.max(guestData.xp, cloudData.xp);
export const mergedStreak = Math.max(guestData.streak, cloudData.streak);
export const mergedSolved = Array.from(new Set([...guestData.solvedQuestionIds, ...cloudData.solvedQuestionIds]));
export const mergedBadges = Array.from(new Set([...guestData.unlockedBadges, ...cloudData.unlockedBadges]));

assert(mergedXp === 220, "Merged XP accurately takes the higher value (220)");
assert(mergedStreak === 4, "Merged Streak accurately takes the higher value (4)");
assert(mergedSolved.length === 3, "Merged solved questions combines both sets without duplicates (3)");
assert(mergedBadges.length === 3, "Merged badges combines all unique unlocked badges (3)");

