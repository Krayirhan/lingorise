import { allQuestions } from "../support/bundledCatalogue";
import { calculateGardenProgress } from "../../src/domain/gamification/xp";
import { evaluateBadges, updateDailyQuests } from "../../src/domain/gamification/badges";
import { countMasteredWords } from "../../src/domain/learning/mastery";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 15. End-to-End User Learning Flow Simulation
console.log("\n15. E2E User Journey (Practice -> Quest -> XP -> Badge Unlock):");
export let state: UserData = { ...DEFAULT_USER_DATA, xp: 120, solvedQuestionIds: [] };

// Step 1: User solves first question
export const q1 = allQuestions[0];
state = {
  ...state,
  xp: state.xp + (q1.xp || 10),
  solvedQuestionIds: [...state.solvedQuestionIds, q1.id],
};
export const journeyTarget = state.dailyQuests.find((q) => q.id === "quest_daily_practice")!.target;
export const questUpdate1 = updateDailyQuests(state.dailyQuests, { type: "PRACTICE", isCorrect: true, amount: 1 });
state.dailyQuests = questUpdate1.updatedQuests;
state.xp += questUpdate1.bonusXpEarned;

assert(state.xp === 130, "XP incremented to 130 after first question");
assert(state.solvedQuestionIds.includes(q1.id), "Solved question ID tracked in user state");
assert(state.dailyQuests.find((q) => q.id === "quest_daily_practice")?.current === 1, `Daily quest progress updated to 1/${journeyTarget}`);

// Step 2: User finishes the remaining words -> completes quest -> unlocks Quick Grow badge
export const q2 = allQuestions[1];
state = {
  ...state,
  xp: state.xp + (q2.xp || 10),
  solvedQuestionIds: [...state.solvedQuestionIds, q2.id],
};
export const questUpdate2 = updateDailyQuests(state.dailyQuests, { type: "PRACTICE", isCorrect: true, amount: journeyTarget - 1 });
state.dailyQuests = questUpdate2.updatedQuests;
state.xp += questUpdate2.bonusXpEarned;

assert(state.dailyQuests.find((q) => q.id === "quest_daily_practice")?.completed === true, `Daily practice quest completed (${journeyTarget}/${journeyTarget})`);
assert(state.xp === 170, "Earned +10 XP + 30 Quest Bonus XP (total: 170 XP)");

export const newBadges = evaluateBadges(state);
assert(newBadges.includes("badge_quick_grow"), "Quick Grow badge automatically unlocked at 170 XP");
export const newGarden = calculateGardenProgress(countMasteredWords(state.learningProgress));
assert(newGarden.stage === "sprout", "Garden stays at 'sprout' — XP was earned but nothing is mastered yet");

