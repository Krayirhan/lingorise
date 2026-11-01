import { applyDailyRollover } from "../../src/domain/gamification/dailyRollover";
import { createDailyQuests } from "../../src/domain/gamification/badges";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 19. Daily Rollover — the loop must restart every day
console.log("\n19. Daily Rollover & Quest Reset:");
export const finishedDay: UserData = {
  ...DEFAULT_USER_DATA,
  lastActiveDate: "2026-08-23",
  dailyReviewXpIds: ["a1-mm-01", "a1-mm-02"],
  dailyQuests: createDailyQuests(20, true).map((q) => ({ ...q, current: q.target, completed: true })),
};
export const rolledOver = applyDailyRollover(finishedDay, "2026-08-24");

assert(rolledOver.dailyQuests.every((q) => !q.completed), "New day issues uncompleted quests");
assert(rolledOver.dailyQuests.every((q) => q.current === 0), "New day resets quest progress to zero");
assert(rolledOver.dailyReviewXpIds.length === 0, "New day clears the per-day review XP guard");
assert(rolledOver.questHistory.length === 2, "Closing day's completed quests are archived to history");
assert(rolledOver.questHistory[0].date === "2026-08-23", "Archived entries carry the closing day's date");

export const noBacklog = applyDailyRollover({ ...DEFAULT_USER_DATA, learningProgress: {} }, "2026-08-24");
assert(
  noBacklog.dailyQuests.every((q) => q.id !== "quest_daily_review"),
  "Review quest is withheld when there is nothing to review"
);

