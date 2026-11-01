import { updateDailyQuests } from "../../src/domain/gamification/badges";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { assert } from "../support/assertions";

// 7. Daily Quests Progress
console.log("\n7. Daily Quests Progress:");
export const practiceTarget = DEFAULT_USER_DATA.dailyQuests.find((q) => q.id === "quest_daily_practice")!.target;
assert(practiceTarget === DEFAULT_USER_DATA.practiceSessionSize, `Practice quest target mirrors session size (${practiceTarget})`);

export const qResult = updateDailyQuests(DEFAULT_USER_DATA.dailyQuests, { type: "PRACTICE", isCorrect: true, amount: practiceTarget });
assert(qResult.updatedQuests.find((q) => q.id === "quest_daily_practice")?.completed === true, "Practice quest completed after hitting its target");
assert(qResult.bonusXpEarned === 30, "Earned +30 bonus XP on quest completion");

export const qWrong = updateDailyQuests(DEFAULT_USER_DATA.dailyQuests, { type: "PRACTICE", isCorrect: false, amount: practiceTarget });
assert(qWrong.updatedQuests.find((q) => q.id === "quest_daily_practice")?.current === 0, "Wrong answers never advance a daily quest");
assert(qWrong.bonusXpEarned === 0, "Wrong answers never pay quest bonus XP");

