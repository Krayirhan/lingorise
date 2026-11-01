import { DEFAULT_USER_DATA, normalizeUserData } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 10. Guest Mode & Storage Serialization
console.log("\n10. Guest Mode & Local Storage Integrity:");
export const serialized = JSON.stringify(DEFAULT_USER_DATA);
export const deserialized: UserData = JSON.parse(serialized);
assert(deserialized.xp === DEFAULT_USER_DATA.xp, "Local data serializes and deserializes XP accurately");
assert(deserialized.streak === DEFAULT_USER_DATA.streak, "Local data serializes and deserializes Streak accurately");
assert(Array.isArray(deserialized.dailyQuests), "Daily quests array preserved across storage cycles");
assert(DEFAULT_USER_DATA.xp === 0 && DEFAULT_USER_DATA.streak === 0, "New users begin with zero real progress");
assert(DEFAULT_USER_DATA.unlockedBadges.length === 0 && !DEFAULT_USER_DATA.lastCompletedWord, "New users receive no seeded badge or word");
export const clearedDemo = normalizeUserData({
  ...DEFAULT_USER_DATA,
  xp: 120,
  streak: 3,
  lastCompletedWord: { word: "quiet", meaning: "sessiz", level: "A1" },
});
assert(clearedDemo.xp === 0 && clearedDemo.streak === 0 && clearedDemo.unlockedBadges.length === 0, "Untouched legacy demo profile is cleared safely");

