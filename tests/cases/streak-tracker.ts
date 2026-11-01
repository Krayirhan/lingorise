import { updateDailyStreak } from "../../src/domain/gamification/streak";
import { assert } from "../support/assertions";

// 4. Streak Calculation
console.log("\n4. Streak Tracker:");
export const s1 = updateDailyStreak("2026-08-21", 3);
export const sSame = updateDailyStreak(new Date().toISOString().split("T")[0], 5);
assert(sSame.newStreak === 5, "Same-day activity preserves streak at 5");

// roadmap 18-srs-flow-hardening.md CORE-001 — a backward clock correction
// (NTP resync, timezone change, manual fix) must not reset a real streak.
export const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
export const sBackward = updateDailyStreak(tomorrow, 12);
assert(sBackward.newStreak === 12, "A device clock moving backward across a date boundary does not reset the streak");
assert(!sBackward.isNewDay, "A backward clock reading is not treated as a new day");

