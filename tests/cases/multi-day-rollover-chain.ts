import { applyDailyRollover } from "../../src/domain/gamification/dailyRollover";
import { createDailyQuests } from "../../src/domain/gamification/badges";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 37. Multi-day rollover chain — quests and history across a real week
console.log("\n37. Multi-Day Rollover Chain (7 days):");
{
  let rolloverState: UserData = {
    ...DEFAULT_USER_DATA,
    dailyQuests: createDailyQuests(10, false).map((q) => ({ ...q, current: q.target, completed: true })),
  };
  let lastActive = "2026-02-01";

  for (let day = 1; day <= 7; day += 1) {
    const closingDate = lastActive;
    const nextDate = `2026-02-0${day + 1}`;
    rolloverState = applyDailyRollover(rolloverState, nextDate);
    // Simulate the day being fully completed again, so the next rollover has
    // something real to archive.
    rolloverState = {
      ...rolloverState,
      dailyQuests: rolloverState.dailyQuests.map((q) => ({ ...q, current: q.target, completed: true })),
    };
    lastActive = nextDate;
  }

  assert(rolloverState.questHistory.length === 7, `A full week of completed days archives 7 entries (got ${rolloverState.questHistory.length})`);
  assert(
    new Set(rolloverState.questHistory.map((h) => h.date)).size === 7,
    "Each archived day has a distinct date — no day is silently merged or dropped"
  );
  assert(
    rolloverState.dailyQuests.every((q) => q.current === q.target && q.completed),
    "The simulated week's final day quest state is exactly what was set, not stale"
  );
}

