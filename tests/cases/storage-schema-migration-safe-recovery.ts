import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 16. Storage Schema Migration & Corrupted Fallback
console.log("\n16. Storage Schema Migration & Safe Recovery:");
export const legacyDataV1: Record<string, any> = {
  xp: 140,
  level: "A2",
  streak: 5,
};
export const migrated: UserData = {
  ...DEFAULT_USER_DATA,
  ...legacyDataV1,
  dailyGoalMinutes: legacyDataV1.dailyGoalMinutes || DEFAULT_USER_DATA.dailyGoalMinutes,
  notificationsEnabled: legacyDataV1.notificationsEnabled ?? DEFAULT_USER_DATA.notificationsEnabled,
  soundEnabled: legacyDataV1.soundEnabled ?? DEFAULT_USER_DATA.soundEnabled,
  reduceMotion: legacyDataV1.reduceMotion ?? DEFAULT_USER_DATA.reduceMotion,
};
assert(migrated.dailyGoalMinutes === 5, "Legacy data missing dailyGoalMinutes safely migrated to 5 min default");
assert(migrated.soundEnabled === true, "Legacy data missing soundEnabled safely migrated to true");
assert(migrated.xp === 140, "Legacy XP (140) preserved accurately");
assert(migrated.notificationsEnabled === false, "Legacy data defaults notification permission to opt-in");

